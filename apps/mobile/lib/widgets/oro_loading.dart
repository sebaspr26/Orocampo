import 'package:flutter/material.dart';
import 'oro_logo_painter.dart';
import '../config/app_theme.dart';

class OroLoading extends StatefulWidget {
  final double size;
  final Color? color;

  const OroLoading({super.key, this.size = 120, this.color});

  @override
  State<OroLoading> createState() => _OroLoadingState();
}

class _OroLoadingState extends State<OroLoading> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (_, __) => CustomPaint(
          painter: OroLogoPainter(
            progress: _controller.value,
            color: widget.color ?? AppColors.primaryDark,
            strokeWidth: 60,
          ),
        ),
      ),
    );
  }
}
