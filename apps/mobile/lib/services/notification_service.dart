import 'dart:async';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  NotificationService._();
  static final instance = NotificationService._();

  final _plugin = FlutterLocalNotificationsPlugin();
  Timer? _testTimer;
  int _notifId = 0;

  Future<void> init() async {
    const androidSettings = AndroidInitializationSettings('ic_notify');
    const initSettings = InitializationSettings(android: androidSettings);
    await _plugin.initialize(settings: initSettings);

    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  }

  Future<void> show({
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'orocampo_channel',
      'Orocampo',
      channelDescription: 'Notificaciones de Orocampo',
      importance: Importance.high,
      priority: Priority.high,
      icon: 'ic_notify',
    );

    await _plugin.show(
      id: _notifId++,
      title: title,
      body: body,
      notificationDetails: const NotificationDetails(android: androidDetails),
    );
  }

  void startTest() {
    _testTimer?.cancel();
    _notifId = 0;
    _testTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      show(
        title: 'OROCAMPO',
        body: 'Notificacion de prueba #${timer.tick}',
      );
    });
  }

  void stopTest() {
    _testTimer?.cancel();
    _testTimer = null;
  }

  bool get isTestRunning => _testTimer?.isActive ?? false;
}
