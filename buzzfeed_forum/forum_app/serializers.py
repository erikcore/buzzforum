from models import Thread, Comment
from rest_framework import serializers
from django.db.models import F

class CommentSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Comment
		fields = ('thread', 'id', 'thread', 'text', 'username', 'score', 'created_at')

	def create(self, validated_data):
		comment = Comment.objects.create(**validated_data)
		comment.thread.save()
		return comment

class ThreadSerializer(serializers.HyperlinkedModelSerializer):
	comments = CommentSerializer(many=True)

	class Meta:
		model = Thread
		fields = ('id', 'title', 'username', 'description', 'comments', 'created_at')

	def create(self, validated_data):
		comment_data = validated_data.pop('comments')
		thread = Thread.objects.create(**validated_data)
		return thread