<?php

namespace App\Enums\Report;

enum ReportType: string
{
    case POST = 'post';
    case COMMENT = 'comment';
    case USER = 'user';
    case STORY = 'story';

	public function isPost(): bool
	{
		return $this === self::POST;
	}

	public function isComment(): bool
	{
		return $this === self::COMMENT;
	}

	public function isUser(): bool
	{
		return $this === self::USER;
	}

	public function isStory(): bool
	{
		return $this === self::STORY;
	}

    public static function values(): array
    {
        return [
            self::POST->value,
            self::COMMENT->value,
            self::USER->value,
            self::STORY->value,
        ];
    }

	public function label(): string
	{
		return match ($this) {
			self::POST => __('labels.report_type_labels.post'),
			self::COMMENT => __('labels.report_type_labels.comment'),
			self::USER => __('labels.report_type_labels.user'),
			self::STORY => __('labels.report_type_labels.story'),
		};
	}

	public function emoji(): string
	{
		return match ($this) {
			self::POST => '📝',
			self::COMMENT => '💬',
			self::USER => '👤',
			self::STORY => '🎥',
		};
	}
}
