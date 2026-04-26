import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../providers/ruta_provider.dart';
import '../../widgets/oro_refresh_indicator.dart';

class RutaTab extends StatelessWidget {
  const RutaTab({super.key});

  @override
  Widget build(BuildContext context) {
    final ruta = context.watch<RutaProvider>();

    if (ruta.loading) {
      return const Center(child: OroLoading());
    }

    if (ruta.ruta == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.route_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
            const SizedBox(height: 16),
            const Text('Sin ruta asignada', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
            const SizedBox(height: 8),
            const Text('Contacta al administrador', style: TextStyle(fontSize: 13, color: AppColors.muted)),
          ],
        ),
      );
    }

    return OroRefreshIndicator(
      onRefresh: () => ruta.loadRuta(),
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ruta.ruta!.nombre, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
                    const SizedBox(height: 4),
                    Text('${ruta.totalClientes} clientes asignados', style: const TextStyle(fontSize: 13, color: AppColors.muted)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(color: AppColors.successBg, borderRadius: BorderRadius.circular(20)),
                child: Text('${ruta.entregadosCount}/${ruta.totalClientes}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.success)),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: ruta.totalClientes > 0 ? ruta.entregadosCount / ruta.totalClientes : 0,
              backgroundColor: AppColors.inputBg,
              color: AppColors.success,
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 24),

          // Clientes
          ...ruta.clientes.map((cliente) {
            final visitado = ruta.isVisitado(cliente.id);
            final entregado = ruta.isEntregado(cliente.id);

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: entregado ? AppColors.successBg.withOpacity(0.5) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: entregado ? AppColors.success.withOpacity(0.3) : AppColors.inputBg, width: 1.5),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: entregado ? AppColors.success.withOpacity(0.1) : AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          entregado ? Icons.check_circle_rounded : Icons.person_outline_rounded,
                          color: entregado ? AppColors.success : AppColors.primaryDark,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(cliente.nombre, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: entregado ? AppColors.success : AppColors.dark)),
                            if (cliente.direccion != null)
                              Text(cliente.direccion!, style: const TextStyle(fontSize: 12, color: AppColors.muted), maxLines: 1, overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (cliente.telefono != null) ...[
                    const SizedBox(height: 8),
                    Row(children: [
                      const Icon(Icons.phone_outlined, size: 14, color: AppColors.muted),
                      const SizedBox(width: 6),
                      Text(cliente.telefono!, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                    ]),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _ActionChip(
                          label: visitado ? 'Visitado' : 'Marcar visitado',
                          icon: visitado ? Icons.check : Icons.location_on_outlined,
                          active: visitado,
                          onTap: () => ruta.toggleVisitado(cliente.id),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _ActionChip(
                          label: entregado ? 'Entregado' : 'Marcar entregado',
                          icon: entregado ? Icons.check_circle : Icons.local_shipping_outlined,
                          active: entregado,
                          color: AppColors.success,
                          onTap: () => ruta.toggleEntregado(cliente.id),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final Color color;
  final VoidCallback onTap;

  const _ActionChip({required this.label, required this.icon, required this.active, this.color = AppColors.primaryDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: active ? color.withOpacity(0.1) : AppColors.inputBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: active ? color.withOpacity(0.3) : Colors.transparent),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: active ? color : AppColors.muted),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: active ? color : AppColors.muted)),
          ],
        ),
      ),
    );
  }
}
