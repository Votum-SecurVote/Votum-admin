import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool showPassword = false;

  // Modernized Palette
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color inputFill = Color(0xFFF9FAFB);
  static const Color inputBorder = Color(0xFFE5E7EB);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  const Icon(
                    Icons.account_balance_rounded,
                    size: 48,
                    color: brandPrimary,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'VOTE.GOV',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      letterSpacing: 2.5,
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                      color: brandPrimary,
                    ),
                  ),

                  const SizedBox(height: 48),

                  // Heading
                  const Text(
                    'Welcome back',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: textMain,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Please enter your credentials to continue.',
                    style: TextStyle(fontSize: 15, color: textSecondary),
                  ),

                  const SizedBox(height: 32),

                  // Email
                  _buildSimpleField(
                    controller: emailController,
                    label: 'Email Address',
                    hint: 'name@example.com',
                    icon: Icons.email_outlined,
                  ),

                  const SizedBox(height: 20),

                  // Password
                  _buildSimpleField(
                    controller: passwordController,
                    label: 'Password',
                    hint: 'Enter your password',
                    icon: showPassword
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                    obscure: !showPassword,
                    onIconTap: () =>
                        setState(() => showPassword = !showPassword),
                    isLast: true,
                  ),

                  // Forgot Password
                  Align(
                    alignment: Alignment.centerRight,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: TextButton(
                        onPressed: () {},
                        style: TextButton.styleFrom(
                          foregroundColor: accentBlue,
                          padding: EdgeInsets.zero,
                        ),
                        child: const Text(
                          'Forgot Password?',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ),

                  // Login Button
                  ElevatedButton(
                    onPressed: () => Navigator.pushNamed(context, '/mfa'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: brandPrimary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Login',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Footer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account? ",
                        style: TextStyle(color: textSecondary),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pushNamed(context, '/register'),
                        child: const Text(
                          'Register now',
                          style: TextStyle(
                            color: brandPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSimpleField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool obscure = false,
    bool isLast = false,
    VoidCallback? onIconTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: textMain,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: obscure,
          textInputAction: isLast ? TextInputAction.done : TextInputAction.next,
          decoration: InputDecoration(
            filled: true,
            fillColor: inputFill,
            hintText: hint,
            suffixIcon: IconButton(
              icon: Icon(icon, color: textSecondary),
              onPressed: onIconTap,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: inputBorder),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: brandPrimary, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}
