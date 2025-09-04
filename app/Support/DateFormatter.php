<?php

namespace App\Support;

use Carbon\Carbon;

class DateFormatter
{
	private string $timestamp;
	private Carbon $carbon;

	public function __construct(string $timestamp) {
		$this->timestamp = $timestamp;
		$this->carbon = (new Carbon($timestamp))->locale(app()->getLocale());
	}

	public function getIso()
	{
		return $this->carbon->isoFormat('LLLL');
	}

	public function getTimeAgo()
	{
		return $this->carbon->shortAbsoluteDiffForHumans();
	}

	public function getCalendar()
	{
		return $this->carbon->format('F, Y');
	}

	public function getFormatted()
	{
		return $this->carbon->format('d M Y, H:i');
	}

	public function getDate()
	{
		return $this->carbon->format('d M, Y');
	}

	public function getTimestamp()
	{
		return $this->timestamp;
	}

	public function isGt(Carbon $timeObject)
	{
		return $this->carbon->gt($timeObject);
	}

	public function isPast()
	{
		return $this->carbon->isPast();
	}

	public function getRemainingHours()
	{
		return floor(max(1, now()->diffInHours(Carbon::parse($this->getTimestamp()))));
	}
}
