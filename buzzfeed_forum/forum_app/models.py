from django.db import models

class Thread(models.Model):
	title = models.CharField(max_length=255)
	username = models.CharField(max_length=255)
	description = models.CharField(max_length=255, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

class Comment(models.Model):
	thread = models.ForeignKey(Thread, related_name='comments')
	text = models.TextField()
	username = models.CharField(max_length=255)
	score = models.IntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-score', '-created_at']