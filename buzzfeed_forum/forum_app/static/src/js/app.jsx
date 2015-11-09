
var currentThreads = {};
var currentThreadsArray = [];
var currentThreadsNextPage = null;

var ForumBox = React.createClass({
	loadThreadsFromServer: function() {
		$.ajax({
			url: currentThreadsNextPage ? currentThreadsNextPage : this.props.url,
			dataType:'json',
			cache: false,
			success: function(response) {
				Array.prototype.push.apply(currentThreadsArray, response['results']);
				//currentThreadsArray.push(response['results']);
				response['results'].forEach(function (result) {
					currentThreads[result['id']] = result;
				});
				this.setState({data: currentThreadsArray});
				if (response['next']) {
					currentThreadsNextPage = response['next'];
				} else {
					$('.moreThreads').hide();
				}
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	loadNextPage: function(e) {
		e.preventDefault();
		this.loadThreadsFromServer();
	},
	handleThreadSubmit: function(thread) {
		$.ajax({
			url: "/api/threads/",
			dataType: 'json',
			type: 'POST',
			data: thread,
			success: function(data) {
				currentThreadsArray.unshift(data);
				this.setState({data: currentThreadsArray})
			}.bind(this),
			error: function(xhr, status, err) {
				console.error("/api/threads/", status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return { data: currentThreadsArray }
	},
	componentDidMount: function() {
		if (currentThreadsArray.length == 0) {
			this.loadThreadsFromServer();
		}
	},
	render: function() {
		return (
			<div className="forumBox">
				<div id="recentThreads">RECENT THREADS</div>
				<ThreadList data={this.state.data} />
				<a href="#" className="moreThreads" onClick={this.loadNextPage}>Load more threads!</a>
				<ThreadForm onThreadSubmit={this.handleThreadSubmit} />
			</div>
		);
	}
});

var ThreadList = React.createClass({
	render: function() {
		var threadNodes = this.props.data.map(function (thread) {
			return (
				<Thread thread={thread}></Thread>
			);
		});
		return (
			<div className="threadList">
				{threadNodes}
			</div>
		);
	}
});

var Thread = React.createClass({
	handleClick: function(event) {
		event.preventDefault();
		history.pushState(null, null, window.location.pathname + 'thread/' + this.props.thread.id);
		handleNewHash();
	},
	render: function() {
		return (
			<div className="thread">
				<div className="threadTitle"><a href="#" onClick={this.handleClick}>{this.props.thread.title}</a></div> 
				<span className="threadAttribute"> posted by {this.props.thread.username} | {this.props.thread.comments ? this.props.thread.comments.length : 0} comments</span>
			</div>
		);
	}
});

var ThreadForm = React.createClass({
	handleSubmit: function(e) {
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
		this.props.onThreadSubmit({username: username, title: title, description: description});
		this.refs.username.value = '';
		this.refs.title.value = '';
		this.refs.description.value = '';
		return;
	},
	render: function() {
		return (
			<div className="formWrapper">
				<form className="threadForm" onSubmit={this.handleSubmit}>
					<input type="text" placeholder="Enter a title for your new thread" ref="title" /><br />
					<input type="text" placeholder="Enter your name (optional)" ref="username" /><br />
					<input type="text" placeholder="Enter a description of your new thread (optional)" ref="description" /><br />
					<input type="submit" value="Create thread!" />
				</form>
			</div>
		);
	}
});

var ThreadBox = React.createClass({
	handleCommentSubmit: function(comment) {
		$.ajax({
			url: "/api/comments/",
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: function(data) {
				this.state.requestedThread.comments.unshift(data);
				this.setState({requestedThread: this.state.requestedThread});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error("/api/comments/", status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return { requestedThread: {} }
	},
	componentDidMount: function() {
		var requestedThread;
		if (currentThreads[this.props.threadId]) {
			this.setState({requestedThread: currentThreads[this.props.threadId]});
		} else {
			$.ajax({
				url: '/api/threads/?format=json&id=' + this.props.threadId,
				dataType:'json',
				cache: false,
				success: function(response) {
					this.setState({requestedThread: response['results'][0]});
				}.bind(this),
				error: function(xhr, status, err) {
					console.error('/api/threads/?format=json&id=' + this.props.threadId, status, err.toString());
				}.bind(this)
			});
		}
	},
	render: function() {
		return (
			<div className="threadBox">
				<div className="threadBoxTitle">{this.state.requestedThread.title}</div>
				<div className="threadBoxDescription">{this.state.requestedThread.description}</div>
				<div className="threadBoxThreadAuthor">Posted by {this.state.requestedThread.username}</div>
				<CommentList data={this.state.requestedThread.comments} />
				<CommentForm threadId={this.state.requestedThread.id} onCommentSubmit={this.handleCommentSubmit} />
			</div>
		);
	}
});

var CommentList = React.createClass({
	render: function() {
		var data = [];
		if (this.props.data) {
			data = this.props.data;
		}
		var commentNodes = data.map(function (comment) {
			return (
				<Comment comment={comment}></Comment>
			);
		});
		return (
			<div className="commentList">
				{commentNodes}
			</div>
		);
	}
});

var Comment = React.createClass({
	handleClick: function(event) {
		// TODO: increment comment vote
		event.preventDefault();
		console.log('need to add a vote for '+ this.props.comment.id);
		$.ajax({
			url: "/api/comments/"+this.props.comment.id+"/increment_score/",
			dataType: 'json',
			type: 'POST',
			data: {},
			success: function(data) {
				$('#commentScore_'+data.id).text(parseInt($('#commentScore_'+data.id).text().trim())+1);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error("/api/comments/"+this.props.comment.id+"/increment_score/", status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div className="comment">
				<div className="commentText">
					<div className="voteAndScore">
						<div><a className="commentVote" href="#" onClick={this.handleClick}>▲</a></div>
						<div><span id={"commentScore_"+this.props.comment.id}>{this.props.comment.score}</span></div>
					</div>
					<div>{this.props.comment.text}</div>
					<div className="commentAttribute">
						by {this.props.comment.username}
					</div>
				</div>
			</div>
		);
	}
});

var CommentForm = React.createClass({
	handleSubmit: function(e) {
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
		this.props.onCommentSubmit({thread: '/api/threads/'+threadId+'/', username: username, text: text});
		this.refs.threadId.value = '';
		this.refs.username.value = '';
		this.refs.text.value = '';
		return;
	},
	render: function() {
		return (
			<div className="commentFormWrapper" onSubmit={this.handleSubmit}>
				<form className="commentForm">
					<input type="hidden" value={parseInt(this.props.threadId)} ref="threadId" />
					<input type="text" placeholder="Enter your comment..." ref="text" /><br />
					<input type="text" placeholder="Enter your name (optional)" ref="username" /><br />
					<input type="submit" value="Post comment!" />
				</form>
			</div>
		);
	}
});

// Routing
var Application = React.createClass({
	render: function() {
		switch (this.props.location[1]) {
			case '':
				return (
					<ForumBox url='/api/threads/?format=json' />
				);
			case 'thread':
				return (
					<ThreadBox threadId={this.props.location[2]} />
				);
			default:
				return (
					<div><h1>CAN'T FIND WHAT YOU'RE LOOKING FOR BRAH.</h1></div>
				);
		}
	}
});

function handleNewHash() {
	var location = window.location.pathname.split('/');
	var application = <Application location={location} />;
	ReactDOM.render(application, document.getElementById('content'));
}

window.addEventListener("popstate", function(e) {
	handleNewHash();
});

handleNewHash();
window.addEventListener('hashchange', handleNewHash, false);