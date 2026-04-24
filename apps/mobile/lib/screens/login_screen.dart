import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  static const _gold = Color(0xFFD4AF37);
  static const _darkGold = Color(0xFF735C00);
  static const _bg = Color(0xFFFCF9F8);
  static const _muted = Color(0xFF7F7663);
  static const _dark = Color(0xFF1C1B1B);
  static const _errorColor = Color(0xFF93000A);
  static const _errorBg = Color(0xFFFFDAD6);
  static const _inputBg = Color(0xFFF6F3F2);

  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String _errorMsg = '';

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;

    if (email.isEmpty || pass.isEmpty) {
      setState(() => _errorMsg = 'Completa todos los campos.');
      return;
    }

    setState(() {
      _errorMsg = '';
      _loading = true;
    });

    await Future.delayed(const Duration(milliseconds: 700));

    if (email == 'domiciliario@gmail.com' && pass == 'domi123') {
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } else {
      setState(() {
        _errorMsg = 'Correo o contraseña incorrectos.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 48),
          child: Column(
            children: [
              // ── Brand ──────────────────────────────────────
              Image.asset(
                'assets/images/orocampoApp.png',
                height: 110,
              ),
              const SizedBox(height: 12),
              const Text(
                'OROCAMPO',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: _dark,
                  letterSpacing: 5,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'PREMIUM DAIRY MANAGEMENT',
                style: TextStyle(
                  fontSize: 9,
                  letterSpacing: 3,
                  color: _muted,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 40),

              // ── Card ───────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 48,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Bienvenido',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: _dark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Ingresa tus credenciales para acceder al portal.',
                      style: TextStyle(fontSize: 13, color: _muted),
                    ),
                    const SizedBox(height: 24),

                    // Error banner
                    if (_errorMsg.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: _errorBg,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: _errorColor.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded, color: _errorColor, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMsg,
                                style: const TextStyle(color: _errorColor, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                    ],

                    // Email
                    const Text(
                      'CORREO INSTITUCIONAL',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: _muted,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(fontSize: 14, color: _dark),
                      decoration: InputDecoration(
                        hintText: 'domiciliario@gmail.com',
                        hintStyle: const TextStyle(color: Color(0xFFD0C5AF), fontSize: 14),
                        prefixIcon: const Icon(Icons.mail_outline_rounded, color: _muted, size: 20),
                        filled: true,
                        fillColor: _inputBg,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: _gold, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Password
                    const Text(
                      'CONTRASEÑA',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: _muted,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _passCtrl,
                      obscureText: _obscure,
                      style: const TextStyle(fontSize: 14, color: _dark),
                      onSubmitted: (_) => _login(),
                      decoration: InputDecoration(
                        hintText: '••••••••••',
                        hintStyle: const TextStyle(color: Color(0xFFD0C5AF), fontSize: 14),
                        prefixIcon: const Icon(Icons.lock_outline_rounded, color: _muted, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: _muted,
                            size: 20,
                          ),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                        filled: true,
                        fillColor: _inputBg,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: _gold, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Submit
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _gold,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: _gold.withOpacity(0.6),
                          shape: const StadiumBorder(),
                          elevation: 6,
                          shadowColor: _gold.withOpacity(0.35),
                        ),
                        child: _loading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                              )
                            : const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'INGRESAR AL SISTEMA',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.5,
                                      fontSize: 13,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(Icons.arrow_forward_rounded, size: 18),
                                ],
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              // ── Footer badges ──────────────────────────────
              const SizedBox(height: 36),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.verified_user_outlined, size: 13, color: _muted.withOpacity(0.6)),
                  const SizedBox(width: 4),
                  Text(
                    'AES-256 CIFRADO',
                    style: TextStyle(fontSize: 9, color: _muted.withOpacity(0.6), fontWeight: FontWeight.w700, letterSpacing: 1.5),
                  ),
                  const SizedBox(width: 20),
                  Icon(Icons.public_rounded, size: 13, color: _muted.withOpacity(0.6)),
                  const SizedBox(width: 4),
                  Text(
                    'ACCESO SEGURO',
                    style: TextStyle(fontSize: 9, color: _muted.withOpacity(0.6), fontWeight: FontWeight.w700, letterSpacing: 1.5),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
