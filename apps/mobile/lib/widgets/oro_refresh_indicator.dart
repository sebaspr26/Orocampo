import 'package:flutter/material.dart';
import 'package:custom_refresh_indicator/custom_refresh_indicator.dart';
import 'oro_logo_painter.dart';
import '../config/app_theme.dart';

class OroRefreshIndicator extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;

  const OroRefreshIndicator({super.key, required this.child, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return CustomMaterialIndicator(
      onRefresh: onRefresh,
      indicatorBuilder: (context, controller) {
        return AnimatedBuilder(
          animation: controller,
          builder: (context, _) {
            return Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, 4))],
              ),
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: CustomPaint(
                  painter: OroLogoPainter(
                    progress: controller.value.clamp(0.0, 1.0),
                    color: AppColors.primaryDark,
                    strokeWidth: 80,
                  ),
                ),
              ),
            );
          },
        );
      },
      child: child,
    );
  }
}
