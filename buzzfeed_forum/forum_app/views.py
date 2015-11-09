from django.shortcuts import render, get_object_or_404
from models import Thread, Comment
from rest_framework import viewsets, generics, filters, status
from serializers import ThreadSerializer, CommentSerializer
from rest_framework.decorators import detail_route
from rest_framework.response import Response

def index(request):
	return render(request, 'base.html', {})

class ThreadViewSet(viewsets.ModelViewSet):
	"""
	API endpoint that allows threads to be viewed
	"""
	filter_backends = [filters.DjangoFilterBackend]
	filter_fields = ['id']
	queryset = Thread.objects.all().order_by('-updated_at')
	serializer_class = ThreadSerializer

class CommentViewSet(viewsets.ModelViewSet):
	"""
	API endpoint that allows comments to be viewed
	"""
	queryset = Comment.objects.all()
	serializer_class = CommentSerializer

	@detail_route(methods=['post'])
	def increment_score(self, request, pk=None):
		comment = self.get_object()
		self.object = get_object_or_404(Comment, pk=pk)
		print pk
		self.object.score += 1
		self.object.save()
		serializer = self.get_serializer(self.object)
		return Response(serializer.data)
