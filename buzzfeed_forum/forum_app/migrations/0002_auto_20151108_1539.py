# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forum_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='thread_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='comment',
            name='lft',
            field=models.IntegerField(default=2),
        ),
        migrations.AlterField(
            model_name='comment',
            name='rgt',
            field=models.IntegerField(default=3),
        ),
        migrations.AlterField(
            model_name='thread',
            name='lft',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='thread',
            name='rgt',
            field=models.IntegerField(default=1),
        ),
    ]
