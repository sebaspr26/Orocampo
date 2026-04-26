import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';
import 'dart:convert';
import '../models/user.dart';

class AuthService {
  static final AuthService _instance = AuthService._();
  static AuthService get instance => _instance;

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  User? _currentUser;
  String? _deviceToken;

  AuthService._();

  User? get currentUser => _currentUser;
  String? get deviceToken => _deviceToken;

  Future<String?> getToken() => _storage.read(key: 'jwt_token');

  Future<String> getDeviceToken() async {
    if (_deviceToken != null) return _deviceToken!;
    _deviceToken = await _storage.read(key: 'device_token');
    if (_deviceToken == null) {
      _deviceToken = const Uuid().v4();
      await _storage.write(key: 'device_token', value: _deviceToken!);
    }
    return _deviceToken!;
  }

  Future<void> saveSession(String token, User user) async {
    await _storage.write(key: 'jwt_token', value: token);
    await _storage.write(key: 'user', value: jsonEncode(user.toJson()));
    _currentUser = user;
  }

  Future<User?> loadCachedUser() async {
    final userJson = await _storage.read(key: 'user');
    if (userJson == null) return null;
    _currentUser = User.fromJson(jsonDecode(userJson));
    return _currentUser;
  }

  Future<bool> isAuthenticated() async {
    final token = await getToken();
    if (token == null) return false;
    await loadCachedUser();
    return _currentUser != null;
  }

  Future<void> logout() async {
    _currentUser = null;
    final dt = _deviceToken;
    // Preservar device_token entre sesiones
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'user');
    _deviceToken = dt;
  }
}
