'use strict';

var currentThreads = {};
var currentThreadsArray = [];
var currentThreadsNextPage = null;

var ForumBox = React.createClass({
	loadThreadsFromServer: function loadThreadsFromServer() {
		$.ajax({
			url: currentThreadsNextPage ? currentThreadsNextPage : this.props.url,
			dataType: 'json',
			cache: false,
			success: (function (response) {
				Array.prototype.push.apply(currentThreadsArray, response['results']);
				//currentThreadsArray.push(response['results']);
				response['results'].forEach(function (result) {
					currentThreads[result['id']] = result;
				});
				this.setState({ data: currentThreadsArray });
				if (response['next']) {
					currentThreadsNextPage = response['next'];
				} else {
					$('.moreThreads').hide();
				}
			}).bind(this),
			error: (function (xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}).bind(this)
		});
	},
	loadNextPage: function loadNextPage(e) {
		e.preventDefault();
		this.loadThreadsFromServer();
	},
	handleThreadSubmit: function handleThreadSubmit(thread) {
		$.ajax({
			url: "/api/threads/",
			dataType: 'json',
			type: 'POST',
			data: thread,
			success: (function (data) {
				currentThreadsArray.unshift(data);
				this.setState({ data: currentThreadsArray });
			}).bind(this),
			error: (function (xhr, status, err) {
				console.error("/api/threads/", status, err.toString());
			}).bind(this)
		});
	},
	getInitialState: function getInitialState() {
		return { data: currentThreadsArray };
	},
	componentDidMount: function componentDidMount() {
		if (currentThreadsArray.length == 0) {
			this.loadThreadsFromServer();
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'forumBox' },
			React.createElement(
				'div',
				{ id: 'recentThreads' },
				'RECENT THREADS'
			),
			React.createElement(ThreadList, { data: this.state.data }),
			React.createElement(
				'a',
				{ href: '#', className: 'moreThreads', onClick: this.loadNextPage },
				'Load more threads!'
			),
			React.createElement(ThreadForm, { onThreadSubmit: this.handleThreadSubmit })
		);
	}
});

var ThreadList = React.createClass({
	render: function render() {
		var threadNodes = this.props.data.map(function (thread) {
			return React.createElement(Thread, { thread: thread });
		});
		return React.createElement(
			'div',
			{ className: 'threadList' },
			threadNodes
		);
	}
});

var Thread = React.createClass({
	handleClick: function handleClick(event) {
		event.preventDefault();
		history.pushState(null, null, window.location.pathname + 'thread/' + this.props.thread.id);
		handleNewHash();
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'thread' },
			React.createElement(
				'div',
				{ className: 'threadTitle' },
				React.createElement(
					'a',
					{ href: '#', onClick: this.handleClick },
					this.props.thread.title
				)
			),
			React.createElement(
				'span',
				{ className: 'threadAttribute' },
				' posted by ',
				this.props.thread.username,
				' | ',
				this.props.thread.comments ? this.props.thread.comments.length : 0,
				' comments'
			)
		);
	}
});

var ThreadForm = React.createClass({
	handleSubmit: function handleSubmit(e) {
		e.preventDefault();
		var username = this.refs.username.value.trim();
		var title = this.refs.title.value.trim();
		var description = this.refs.description.value.trim();
		if (!title) {
			return;
		}
		if (!username) {
			username = "Anonymous";
		}
		if (!description) {
			description = "";
		}
		this.props.onThreadSubmit({ username: username, title: title, description: description });
		this.refs.username.value = '';
		this.refs.title.value = '';
		this.refs.description.value = '';
		return;
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'formWrapper' },
			React.createElement(
				'form',
				{ className: 'threadForm', onSubmit: this.handleSubmit },
				React.createElement('input', { type: 'text', placeholder: 'Enter a title for your new thread', ref: 'title' }),
				React.createElement('br', null),
				React.createElement('input', { type: 'text', placeholder: 'Enter your name (optional)', ref: 'username' }),
				React.createElement('br', null),
				React.createElement('input', { type: 'text', placeholder: 'Enter a description of your new thread (optional)', ref: 'description' }),
				React.createElement('br', null),
				React.createElement('input', { type: 'submit', value: 'Create thread!' })
			)
		);
	}
});

var ThreadBox = React.createClass({
	handleCommentSubmit: function handleCommentSubmit(comment) {
		$.ajax({
			url: "/api/comments/",
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: (function (data) {
				this.state.requestedThread.comments.unshift(data);
				this.setState({ requestedThread: this.state.requestedThread });
			}).bind(this),
			error: (function (xhr, status, err) {
				console.error("/api/comments/", status, err.toString());
			}).bind(this)
		});
	},
	getInitialState: function getInitialState() {
		return { requestedThread: {} };
	},
	componentDidMount: function componentDidMount() {
		var requestedThread;
		if (currentThreads[this.props.threadId]) {
			this.setState({ requestedThread: currentThreads[this.props.threadId] });
		} else {
			$.ajax({
				url: '/api/threads/?format=json&id=' + this.props.threadId,
				dataType: 'json',
				cache: false,
				success: (function (response) {
					this.setState({ requestedThread: response['results'][0] });
				}).bind(this),
				error: (function (xhr, status, err) {
					console.error('/api/threads/?format=json&id=' + this.props.threadId, status, err.toString());
				}).bind(this)
			});
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'threadBox' },
			React.createElement(
				'div',
				{ className: 'threadBoxTitle' },
				this.state.requestedThread.title
			),
			React.createElement(
				'div',
				{ className: 'threadBoxDescription' },
				this.state.requestedThread.description
			),
			React.createElement(
				'div',
				{ className: 'threadBoxThreadAuthor' },
				'Posted by ',
				this.state.requestedThread.username
			),
			React.createElement(CommentList, { data: this.state.requestedThread.comments }),
			React.createElement(CommentForm, { threadId: this.state.requestedThread.id, onCommentSubmit: this.handleCommentSubmit })
		);
	}
});

var CommentList = React.createClass({
	render: function render() {
		var data = [];
		if (this.props.data) {
			data = this.props.data;
		}
		var commentNodes = data.map(function (comment) {
			return React.createElement(Comment, { comment: comment });
		});
		return React.createElement(
			'div',
			{ className: 'commentList' },
			commentNodes
		);
	}
});

var Comment = React.createClass({
	handleClick: function handleClick(event) {
		// TODO: increment comment vote
		event.preventDefault();
		console.log('need to add a vote for ' + this.props.comment.id);
		$.ajax({
			url: "/api/comments/" + this.props.comment.id + "/increment_score/",
			dataType: 'json',
			type: 'POST',
			data: {},
			success: (function (data) {
				$('#commentScore_' + data.id).text(parseInt($('#commentScore_' + data.id).text().trim()) + 1);
			}).bind(this),
			error: (function (xhr, status, err) {
				console.error("/api/comments/" + this.props.comment.id + "/increment_score/", status, err.toString());
			}).bind(this)
		});
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'comment' },
			React.createElement(
				'div',
				{ className: 'commentText' },
				React.createElement(
					'div',
					{ className: 'voteAndScore' },
					React.createElement(
						'div',
						null,
						React.createElement(
							'a',
							{ className: 'commentVote', href: '#', onClick: this.handleClick },
							'▲'
						)
					),
					React.createElement(
						'div',
						null,
						React.createElement(
							'span',
							{ id: "commentScore_" + this.props.comment.id },
							this.props.comment.score
						)
					)
				),
				React.createElement(
					'div',
					null,
					this.props.comment.text
				),
				React.createElement(
					'div',
					{ className: 'commentAttribute' },
					'by ',
					this.props.comment.username
				)
			)
		);
	}
});

var CommentForm = React.createClass({
	handleSubmit: function handleSubmit(e) {
		e.preventDefault();
		var threadId = this.refs.threadId.value.trim();
		var text = this.refs.text.value.trim();
		var username = this.refs.username.value.trim();
		if (!text) {
			return;
		}
		if (!username) {
			username = "Anonymous";
		}
		this.props.onCommentSubmit({ thread: '/api/threads/' + threadId + '/', username: username, text: text });
		this.refs.threadId.value = '';
		this.refs.username.value = '';
		this.refs.text.value = '';
		return;
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'commentFormWrapper', onSubmit: this.handleSubmit },
			React.createElement(
				'form',
				{ className: 'commentForm' },
				React.createElement('input', { type: 'hidden', value: parseInt(this.props.threadId), ref: 'threadId' }),
				React.createElement('input', { type: 'text', placeholder: 'Enter your comment...', ref: 'text' }),
				React.createElement('br', null),
				React.createElement('input', { type: 'text', placeholder: 'Enter your name (optional)', ref: 'username' }),
				React.createElement('br', null),
				React.createElement('input', { type: 'submit', value: 'Post comment!' })
			)
		);
	}
});

// Routing
var Application = React.createClass({
	render: function render() {
		switch (this.props.location[1]) {
			case '':
				return React.createElement(ForumBox, { url: '/api/threads/?format=json' });
			case 'thread':
				return React.createElement(ThreadBox, { threadId: this.props.location[2] });
			default:
				return React.createElement(
					'div',
					null,
					React.createElement(
						'h1',
						null,
						'CAN\'T FIND WHAT YOU\'RE LOOKING FOR BRAH.'
					)
				);
		}
	}
});

function handleNewHash() {
	var location = window.location.pathname.split('/');
	var application = React.createElement(Application, { location: location });
	ReactDOM.render(application, document.getElementById('content'));
}

window.addEventListener("popstate", function (e) {
	handleNewHash();
});

handleNewHash();
window.addEventListener('hashchange', handleNewHash, false);
//# sourceMappingURL=app.js.map
