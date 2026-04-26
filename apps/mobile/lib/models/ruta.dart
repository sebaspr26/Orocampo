import 'cliente.dart';

class Ruta {
  final String id;
  final String nombre;
  final List<Cliente> clientes;

  Ruta({required this.id, required this.nombre, required this.clientes});

  factory Ruta.fromJson(Map<String, dynamic> json) => Ruta(
    id: json['id'],
    nombre: json['nombre'],
    clientes: (json['clientes'] as List?)?.map((e) => Cliente.fromJson(e)).toList() ?? [],
  );
}
