<?php

namespace App;

enum NotificationType: string
{
    case FOLLOW = 'follow';
    case CLASSROOM_CANCELLED = 'classroom_cancelled';
}
