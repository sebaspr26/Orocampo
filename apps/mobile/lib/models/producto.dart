class Producto {
  final String id;
  final String name;

  Producto({required this.id, required this.name});

  factory Producto.fromJson(Map<String, dynamic> json) => Producto(
    id: json['id'],
    name: json['name'],
  );

  Map<String, dynamic> toDb() => {'id': id, 'name': name};
}
