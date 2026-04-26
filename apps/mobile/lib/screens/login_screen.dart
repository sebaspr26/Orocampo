import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;

    if (email.isEmpty || pass.isEmpty) return;

    await context.read<AuthProvider>().login(email, pass);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 48),
          child: Column(
            children: [
              Image.asset('assets/images/orocampoApp.png', height: 110),
              const SizedBox(height: 12),
              const Text(
                'OROCAMPO',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.dark, letterSpacing: 5),
              ),
              const SizedBox(height: 4),
              const Text(
                'GESTIÓN LÁCTEA',
                style: TextStyle(fontSize: 9, letterSpacing: 3, color: AppColors.muted, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 40),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 48, offset: const Offset(0, 8))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Bienvenido', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.dark)),
                    const SizedBox(height: 4),
                    const Text('Ingresa tus credenciales para acceder.', style: TextStyle(fontSize: 13, color: AppColors.muted)),
                    const SizedBox(height: 24),

                    if (auth.error != null) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.errorBg,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.error.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                            const SizedBox(width: 8),
                            Expanded(child: Text(auth.error!, style: const TextStyle(color: AppColors.error, fontSize: 13))),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                    ],

                    const Text('CORREO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.muted, letterSpacing: 2)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(fontSize: 14, color: AppColors.dark),
                      decoration: InputDecoration(
                        hintText: 'correo@orocampo.com',
                        hintStyle: const TextStyle(color: Color(0xFFD0C5AF), fontSize: 14),
                        prefixIcon: const Icon(Icons.mail_outline_rounded, color: AppColors.muted, size: 20),
                        filled: true,
                        fillColor: AppColors.inputBg,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text('CONTRASEÑA', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.muted, letterSpacing: 2)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _passCtrl,
                      obscureText: _obscure,
                      style: const TextStyle(fontSize: 14, color: AppColors.dark),
                      onSubmitted: (_) => _login(),
                      decoration: InputDecoration(
                        hintText: '••••••••••',
                        hintStyle: const TextStyle(color: Color(0xFFD0C5AF), fontSize: 14),
                        prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.muted, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: AppColors.muted, size: 20),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                        filled: true,
                        fillColor: AppColors.inputBg,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 28),

                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: auth.loading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: AppColors.primary.withOpacity(0.6),
                          shape: const StadiumBorder(),
                          elevation: 6,
                          shadowColor: AppColors.primary.withOpacity(0.35),
                        ),
                        child: auth.loading
                            ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                            : const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text('INGRESAR', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1.5, fontSize: 13)),
                                  SizedBox(width: 8),
                                  Icon(Icons.arrow_forward_rounded, size: 18),
                                ],
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 36),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.verified_user_outlined, size: 13, color: AppColors.muted.withOpacity(0.6)),
                  const SizedBox(width: 4),
                  Text('AES-256 CIFRADO', style: TextStyle(fontSize: 9, color: AppColors.muted.withOpacity(0.6), fontWeight: FontWeight.w700, letterSpacing: 1.5)),
                  const SizedBox(width: 20),
                  Icon(Icons.public_rounded, size: 13, color: AppColors.muted.withOpacity(0.6)),
                  const SizedBox(width: 4),
                  Text('ACCESO SEGURO', style: TextStyle(fontSize: 9, color: AppColors.muted.withOpacity(0.6), fontWeight: FontWeight.w700, letterSpacing: 1.5)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
