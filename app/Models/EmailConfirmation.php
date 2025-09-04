<?php

namespace App\Models;

use App\Database\Configs\Table;
use Illuminate\Database\Eloquent\Model;

class EmailConfirmation extends Model
{
    public $fillable = ['email', 'token'];

    public $table = Table::EMAIL_CONF;
}
