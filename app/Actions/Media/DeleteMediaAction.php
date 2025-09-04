<?php

namespace App\Actions\Media;

use App\Models\Media;
use App\Constants\Filesystem;
use Illuminate\Support\Facades\Storage;

class DeleteMediaAction
{
	private Media $mediaData;

	public function __construct(Media $mediaData)
	{
		$this->mediaData = $mediaData;
	}

	public function execute()
	{
		if($this->mediaData->disk !== Filesystem::EXTERNAL_DISK_NAME) {

			// Delete media main file
			if ($this->mediaData->status->isProcessing()) {
				Storage::disk('local')->delete($this->mediaData->source_path);
			}

			else {
				Storage::disk($this->mediaData->disk)->delete($this->mediaData->source_path);
			}
		}

		$this->mediaData->delete();
	}
}
