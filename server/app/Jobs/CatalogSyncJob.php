<?php

namespace App\Jobs;

use App\Models\CatalogSyncLog;
use App\Services\CatalogSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

class CatalogSyncJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 75;

    public bool $failOnTimeout = true;

    public function __construct(public int $runId, public int $expectedStep)
    {
        $this->onQueue(config('catalog_sync.queue'));
    }

    public function backoff(): array
    {
        return [10, 30];
    }

    public function handle(CatalogSyncService $service): void
    {
        $lock = Cache::lock('catalog-sync:run:'.$this->runId, 85);
        if (! $lock->get()) {
            // A recovery delivery must not exhaust its attempts while another
            // worker owns this step (the run lock lasts 85 seconds).
            $this->release(90);

            return;
        }
        try {
            $run = CatalogSyncLog::find($this->runId);
            // A redelivered job cannot advance the same page or apply the same transaction twice.
            if (! $run || $run->step !== $this->expectedStep || ! in_array($run->status, ['scanning', 'applying'], true)) {
                return;
            }
            $service->step($run);
        } catch (Throwable $error) {
            $message = get_class($error) === RuntimeException::class
                ? $error->getMessage() : 'Falló el procesamiento de la sincronización. El catálogo local no fue modificado.';
            if ($this->attempts() >= $this->tries) {
                CatalogSyncLog::whereKey($this->runId)->where('step', $this->expectedStep)->whereIn('status', ['scanning', 'applying'])
                    ->update(['status' => 'failed', 'session' => null, 'error' => $message, 'finished_at' => now()]);
            }
            throw new RuntimeException($message);
        } finally {
            $lock->release();
        }
    }

    public function failed(?Throwable $error): void
    {
        CatalogSyncLog::whereKey($this->runId)->where('step', $this->expectedStep)->whereIn('status', ['scanning', 'applying'])
            ->update(['status' => 'failed', 'session' => null, 'error' => 'La tarea se interrumpió. Revisá el worker y volvé a escanear. No se aplicaron cambios parciales.', 'finished_at' => now()]);
    }
}
