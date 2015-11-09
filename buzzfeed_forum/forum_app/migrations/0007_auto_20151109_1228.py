# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forum_app', '0006_auto_20151108_2151'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='comment',
            options={'ordering': ['-score', '-created_at']},
        ),
        migrations.AlterField(
            model_name='thread',
            name='description',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
