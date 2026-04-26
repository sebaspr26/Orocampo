import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../models/user.dart';

class AuthService {
  static final AuthService _instance = AuthService._();
  static AuthService get instance => _instance;

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  User? _currentUser;

  AuthService._();

  User? get currentUser => _currentUser;

  Future<String?> getToken() => _storage.read(key: 'jwt_token');

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
    await _storage.deleteAll();
  }
}
