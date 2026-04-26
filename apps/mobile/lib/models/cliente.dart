class Cliente {
  final String id;
  final String nombre;
  final String? telefono;
  final String? direccion;
  final bool esMostrador;
  final bool isActive;

  Cliente({
    required this.id,
    required this.nombre,
    this.telefono,
    this.direccion,
    this.esMostrador = false,
    this.isActive = true,
  });

  factory Cliente.fromJson(Map<String, dynamic> json) => Cliente(
    id: json['id'],
    nombre: json['nombre'],
    telefono: json['telefono'],
    direccion: json['direccion'],
    esMostrador: json['esMostrador'] ?? json['es_mostrador'] == 1 ? true : false,
    isActive: json['isActive'] ?? json['is_active'] == 1 ? true : false,
  );

  Map<String, dynamic> toDb() => {
    'id': id,
    'nombre': nombre,
    'telefono': telefono,
    'direccion': direccion,
    'es_mostrador': esMostrador ? 1 : 0,
    'is_active': isActive ? 1 : 0,
  };
}
