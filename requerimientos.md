
2. Definición del Primer Cliente – ORO CAMPO
ORO CAMPO es una distribuidora de productos lácteos especializada en la
comercialización de quesos (costeño, cuajada, criollo y mozzarella). Su
modelo de negocio se basa en la compra, almacenamiento y distribución
diaria de productos perecederos a clientes comerciales.
La empresa opera bajo un esquema tradicional, donde la mayoría de los
procesos son manuales y dependen directamente de las personas.

Funcionamiento Actual de ORO CAMPO
Actualmente la empresa presenta la siguiente dinámica operativa:

1. Gestión de Inventario
● El inventario se lleva de manera manual.
● La mercancía se cuenta físicamente todos los días.
● No existe un sistema digital en tiempo real.
● No hay control automatizado de fechas de vencimiento.
● No se tiene claridad inmediata del stock disponible.
● No se generan alertas cuando el producto está próximo a
agotarse o vencer.

2. Facturación
Uno de los problemas más críticos es que:
● La facturación la realiza el mismo domiciliario (mensajero).
● No existe un sistema centralizado de registro inmediato.
● Las ventas se registran de forma manual durante la ruta.
● No hay sincronización en tiempo real con la oficina.

3. Gestión de Pagos y Cartera
El proceso actual funciona así:
● El cliente realiza el pago.
● El domiciliario toma una foto del comprobante.

Fresa X

● Envía la foto por WhatsApp a la secretaria.
● La secretaria registra manualmente el pago en un archivo de
Excel.
Problemas derivados de este proceso:
● Dependencia total del mensajero para la comunicación.
● Riesgo de pérdida de información.
● Retrasos en el registro.
● Errores en digitación.
● No existe trazabilidad estructurada.
● No hay alertas automáticas de cartera vencida.
● No se puede consultar en tiempo real el estado de cuenta de un
cliente.

Problema Central
ORO CAMPO no tiene un sistema integrado que conecte:
- Inventario
- Ventas
- Facturación
- Pagos
- Cartera
Toda la información está fragmentada entre conteos físicos, WhatsApp
y archivos de Excel.
Esto genera:
- Pérdidas económicas potenciales.
- Baja eficiencia operativa.
- Falta de control interno.
- Riesgo en productos perecederos.
- Dificultad para proyectar crecimiento.
- Dependencia excesiva de personas específicas.

Fresa X

3. Requerimientos funcionales.
Los siguientes requerimientos funcionales describen las funcionalidades que
deberá cumplir el sistema propuesto para la empresa ORO CAMPO.

3.1 Gestión de Usuarios y Roles
RF-01. El sistema deberá permitir el registro y autenticación de usuarios
mediante credenciales seguras.
RF-02. El sistema deberá permitir la creación de roles (Administrador,
Secretaria, Domiciliario).
RF-03. El sistema deberá restringir el acceso a funcionalidades según el rol
asignado.
RF-04. El sistema deberá permitir la modificación y desactivación de
usuarios.

3.2 Gestión de Inventario
RF-05. El sistema deberá permitir registrar productos con información
detallada (tipo de queso, lote, fecha de ingreso, fecha de vencimiento,
cantidad, precio de compra).
RF-06. El sistema deberá actualizar automáticamente el inventario cuando se
registre una venta.
RF-07. El sistema deberá permitir consultar el inventario disponible en
tiempo real.
RF-08. El sistema deberá generar alertas cuando el stock de un producto esté
por debajo del nivel mínimo establecido.
RF-09. El sistema deberá generar alertas cuando un producto esté próximo a
su fecha de vencimiento.

Fresa X
RF-10. El sistema deberá registrar entradas y salidas de mercancía

3.3 Gestión de Ventas y Facturación
RF-11. El sistema deberá permitir al domiciliario registrar ventas desde un
dispositivo móvil.
RF-12. El sistema deberá generar automáticamente una factura digital al
momento de registrar la venta.
RF-13. El sistema deberá asociar cada venta a un cliente específico.
RF-14. El sistema deberá registrar el método de pago (efectivo, transferencia,
crédito).
RF-15. El sistema deberá sincronizar en tiempo real la información de ventas
con el panel administrativo.
RF-16. El sistema deberá permitir la consulta del historial de ventas por
cliente, producto o fecha.

3.4 Gestión de Clientes y Cartera
RF-17. El sistema deberá permitir el registro y actualización de clientes.
RF-18. El sistema deberá llevar el control automático del saldo pendiente por
cliente.
RF-19. El sistema deberá registrar abonos parciales o pagos totales realizados
por los clientes.
RF-20. El sistema deberá generar alertas de cartera vencida.
RF-21. El sistema deberá permitir consultar el estado de cuenta de cada
cliente en tiempo real.

Fresa X

3.5 Gestión de Pagos
RF-22. El sistema deberá permitir al domiciliario registrar pagos recibidos
durante la ruta.
RF-23. El sistema deberá permitir adjuntar evidencia digital del pago
(imagen del comprobante).
RF-24. El sistema deberá actualizar automáticamente la cartera al registrar un
pago.
RF-25. El sistema deberá registrar quién realizó el registro del pago y la
fecha correspondiente.

3.6 Reportes y Análisis
RF-26. El sistema deberá generar reportes de ventas por periodo.
RF-27. El sistema deberá generar reportes de ventas por producto.
RF-28. El sistema deberá generar reportes de ventas por cliente.
RF-29. El sistema deberá calcular el margen de ganancia por producto.
RF-30. El sistema deberá mostrar un panel de indicadores (Dashboard) con
métricas clave: ventas totales, cartera pendiente, inventario disponible y
productos próximos a vencer.
3.7 Gestión de Rutas y Domiciliarios
RF-31. El sistema deberá permitir asignar clientes a rutas específicas por
domiciliario.
RF-32. El sistema deberá registrar el inicio y cierre de ruta del domiciliario.
RF-33. El sistema deberá permitir visualizar en tiempo real el estado de la
ruta (clientes visitados, pendientes, pagos recibidos).

Fresa X
RF-34. Al cerrar la ruta, el sistema deberá generar un resumen de ventas y
cobros del día por domiciliario.
RF-35. El sistema deberá registrar la mercancía entregada al domiciliario al
inicio de la ruta (preliquidación) versus lo vendido al cerrar la ruta.
3.8 Devoluciones y Productos Vencidos
RF-36. El sistema deberá permitir registrar devoluciones de productos por
parte de los clientes.
RF-37. El sistema deberá registrar las bajas de inventario por producto
vencido o en mal estado.
RF-38. El sistema deberá generar reportes de pérdidas por devolución o
vencimiento.
3.9 Gestión de Precios
RF-39. El sistema deberá permitir configurar listas de precios diferenciadas
por cliente o canal.
RF-40. El sistema deberá registrar el historial de cambios de precio por
producto.
3.10 Notificaciones y Comunicación
RF-41. El sistema deberá enviar notificaciones automáticas al administrador
por eventos críticos (stock mínimo, cartera vencida, productos próximos a
vencer).
RF-42. El sistema deberá permitir generar y enviar el estado de cuenta de un
cliente directamente por WhatsApp o correo electrónico.
3.11 Cierre de Caja / Conciliación
RF-43. El sistema deberá generar un corte de caja diario con el total de
recaudos en efectivo y transferencias.

Fresa X
RF-44. El sistema deberá permitir registrar el arqueo de caja al finalizar el
día.
RF-45. El sistema deberá identificar descuadres entre lo cobrado en ruta y lo
registrado en el sistema.
3.12 Reportes adicionales
RF-46. El sistema deberá generar un reporte de productos con mayor rotación
y menor rotación.
RF-47. El sistema deberá generar un reporte de clientes con mayor volumen
de compra.
RF-48.. El sistema deberá generar un reporte de pérdidas por producto
vencido o devuelto en un periodo determinado.

4. Requerimientos No Funcionales
Los siguientes requerimientos no funcionales describen las características de
calidad, restricciones técnicas y condiciones operativas que deberá cumplir el
sistema para la empresa ORO CAMPO.

4.1 Requerimientos de Rendimiento
RNF-01. El sistema deberá responder a cualquier consulta o registro en un
tiempo máximo de 3 segundos bajo condiciones normales de operación.
RNF-02. El sistema deberá soportar múltiples usuarios concurrentes sin
degradación significativa del rendimiento.
RNF-03. La sincronización de información entre el dispositivo del
domiciliario y el sistema central deberá realizarse en tiempo real o con un
retraso máximo de 5 segundos cuando exista conexión a internet.

4.2 Requerimientos de Disponibilidad

Fresa X

RNF-04. El sistema deberá estar disponible al menos el 99% del tiempo
mensual.
RNF-05. El sistema deberá permitir acceso remoto desde cualquier ubicación
con conexión a internet.
RNF-06. En caso de falla del servidor, el sistema deberá contar con
mecanismos de recuperación automática.

4.3 Requerimientos de Seguridad
RNF-07. El sistema deberá implementar autenticación mediante usuario y
contraseña cifrada.
RNF-08. El sistema deberá restringir el acceso a funcionalidades según el rol
del usuario.
RNF-09. Toda la información transmitida deberá estar protegida mediante
protocolos seguros (HTTPS).
RNF-10. El sistema deberá realizar copias de seguridad automáticas diarias.
RNF-11. El sistema deberá registrar un historial de auditoría de acciones
realizadas por los usuarios (ventas, pagos, modificaciones).

4.4 Requerimientos de Usabilidad
RNF-12. La interfaz deberá ser intuitiva y de fácil uso para usuarios con
conocimientos básicos de tecnología.
RNF-13. El sistema deberá estar optimizado para uso en dispositivos móviles
(especialmente para el domiciliario).
RNF-14. Las funciones principales (registro de venta y registro de pago)
deberán poder completarse en menos de 5 pasos.
RNF-15. El sistema deberá presentar información clara mediante paneles
visuales y gráficos sencillos.

Fresa X

4.5 Requerimientos de Escalabilidad
RNF-16. El sistema deberá permitir la incorporación de nuevos usuarios sin
afectar la arquitectura principal.
RNF-17. El sistema deberá permitir agregar nuevos productos y clientes sin
límite predefinido.
RNF-18. La arquitectura deberá permitir futura integración de módulos
adicionales (por ejemplo, predicción de demanda mediante inteligencia
artificial).

4.6 Requerimientos de Mantenibilidad
RNF-19. El sistema deberá estar desarrollado bajo una arquitectura modular.
RNF-20. El código deberá estar documentado para facilitar futuras mejoras.
RNF-21. El sistema deberá permitir actualizaciones sin afectar la operación
del negocio.

4.7 Requerimientos de Compatibilidad
RNF-22. El sistema deberá ser compatible con navegadores modernos
(Chrome, Edge, Firefox).
RNF-23. El sistema deberá funcionar correctamente en dispositivos móviles
Android.
RNF-24. El sistema deberá funcionar en modo offline básico para el
domiciliario (registro de ventas y pagos sin internet), sincronizando al
recuperar la conexión. Este es probablemente el más importante que falta,
dado que los domiciliarios pueden estar en zonas sin señal.
RNF-25. El sistema deberá enviar alertas mediante notificaciones push en
dispositivos móviles.

Fresa X
RNF-26. Las imágenes de comprobantes de pago deberán tener un tamaño
máximo definido para no saturar el almacenamiento.