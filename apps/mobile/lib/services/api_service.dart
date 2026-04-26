import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._();
  static ApiService get instance => _instance;

  late final Dio dio;

  ApiService._() {
    dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.timeout,
      receiveTimeout: ApiConfig.timeout,
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await AuthService.instance.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        final deviceToken = AuthService.instance.deviceToken;
        if (deviceToken != null) {
          options.headers['X-Device-Token'] = deviceToken;
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final code = error.response?.data?['code'];
          if (code == 'SESSION_REVOKED' || code == 'SESSION_EXPIRED') {
            await AuthService.instance.logout();
          } else {
            await AuthService.instance.logout();
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<Response> get(String path) => dio.get(path);

  Future<Response> post(String path, {dynamic data}) =>
      dio.post(path, data: data);

  Future<Response> patch(String path, {dynamic data}) =>
      dio.patch(path, data: data);

  Future<Response> delete(String path) => dio.delete(path);
}
