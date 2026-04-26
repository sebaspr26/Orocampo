import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sync_provider.dart';
import '../config/app_theme.dart';

class SyncIndicator extends StatelessWidget {
  const SyncIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    final sync = context.watch<SyncProvider>();
    if (sync.pendingCount == 0) return const SizedBox.shrink();

    return GestureDetector(
      onTap: sync.isSyncing ? null : () => sync.syncNow(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.offlineBg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (sync.isSyncing)
              const SizedBox(
                width: 12, height: 12,
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.offlineText),
              )
            else
              const Icon(Icons.sync, size: 14, color: AppColors.offlineText),
            const SizedBox(width: 4),
            Text(
              '${sync.pendingCount}',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.offlineText),
            ),
          ],
        ),
      ),
    );
  }
}
