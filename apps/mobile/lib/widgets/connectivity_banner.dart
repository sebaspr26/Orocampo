import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/connectivity_provider.dart';
import '../providers/sync_provider.dart';
import '../config/app_theme.dart';

class ConnectivityBanner extends StatelessWidget {
  const ConnectivityBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final isOnline = context.watch<ConnectivityProvider>().isOnline;
    final pending = context.watch<SyncProvider>().pendingCount;

    if (isOnline && pending == 0) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: isOnline ? AppColors.successBg : AppColors.offlineBg,
      child: Row(
        children: [
          Icon(
            isOnline ? Icons.sync : Icons.cloud_off_rounded,
            size: 16,
            color: isOnline ? AppColors.success : AppColors.offlineText,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isOnline
                  ? 'Sincronizando $pending operación${pending > 1 ? 'es' : ''}...'
                  : 'Sin conexión${pending > 0 ? ' · $pending pendiente${pending > 1 ? 's' : ''}' : ''}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isOnline ? AppColors.success : AppColors.offlineText,
              ),
            ),
          ),
          if (isOnline && pending > 0)
            const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.success),
            ),
        ],
      ),
    );
  }
}
