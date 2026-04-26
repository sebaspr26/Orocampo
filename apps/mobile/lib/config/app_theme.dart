import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFD4AF37);
  static const Color primaryDark = Color(0xFF735C00);
  static const Color surface = Color(0xFFFCF9F8);
  static const Color dark = Color(0xFF1C1B1B);
  static const Color muted = Color(0xFF7F7663);
  static const Color inputBg = Color(0xFFF6F3F2);
  static const Color error = Color(0xFF93000A);
  static const Color errorBg = Color(0xFFFFDAD6);
  static const Color success = Color(0xFF1B6B4C);
  static const Color successBg = Color(0xFFD4F5E4);
  static const Color blue = Color(0xFF5B4FCF);
  static const Color offlineBg = Color(0xFFFFF3CD);
  static const Color offlineText = Color(0xFF856404);
}

class AppTheme {
  static ThemeData get theme => ThemeData(
    useMaterial3: true,
    colorSchemeSeed: AppColors.primary,
    scaffoldBackgroundColor: AppColors.surface,
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.dark,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontFamily: 'Manrope',
        fontWeight: FontWeight.w800,
        fontSize: 18,
        color: AppColors.dark,
        letterSpacing: 1.5,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.inputBg,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: AppColors.primaryDark,
      unselectedItemColor: AppColors.muted,
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
      unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
    ),
  );
}
