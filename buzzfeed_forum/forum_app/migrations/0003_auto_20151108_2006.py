# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forum_app', '0002_auto_20151108_1539'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comment',
            name='lft',
        ),
        migrations.RemoveField(
            model_name='comment',
            name='rgt',
        ),
        migrations.RemoveField(
            model_name='comment',
            name='thread_id',
        ),
        migrations.RemoveField(
            model_name='thread',
            name='lft',
        ),
        migrations.RemoveField(
            model_name='thread',
            name='rgt',
        ),
        migrations.AddField(
            model_name='comment',
            name='thread',
            field=models.ForeignKey(related_name='comments', default=1, to='forum_app.Thread'),
            preserve_default=False,
        ),
    ]
