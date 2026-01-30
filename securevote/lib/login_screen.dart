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
  static const Color brandPrimary = Color(0xFF1A434E); // Deep Slate Teal
  static const Color accentBlue = Color(0xFF3B82F6); // Trust Blue
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF111827); // Darker grey for contrast
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color inputFill = Color(0xFFF9FAFB); // Very subtle grey
  static const Color inputBorder = Color(0xFFE5E7EB); // Light border

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,
      // SafeArea ensures UI doesn't overlap with system bars
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            // Keeps the form from getting too wide on tablets/web
            constraints: const BoxConstraints(maxWidth: 400),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. Clean Centered Header
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

                  // 2. Headings
                  const Text(
                    'Welcome back',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: textMain,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Please enter your details to verify your identity.',
                    style: TextStyle(
                      fontSize: 15,
                      color: textSecondary,
                      height: 1.4,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 3. Inputs
                  _buildSimpleField(
                    controller: emailController,
                    label: 'Email Address',
                    hint: 'name@example.gov',
                    icon: Icons.email_outlined,
                  ),

                  const SizedBox(height: 20),

                  _buildSimpleField(
                    controller: passwordController,
                    label: 'Security PIN',
                    hint: 'Enter your PIN',
                    icon: showPassword
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                    obscure: !showPassword,
                    onIconTap: () =>
                        setState(() => showPassword = !showPassword),
                    isLast: true,
                  ),

                  // Forgot Password Link
                  Align(
                    alignment: Alignment.centerRight,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: TextButton(
                        onPressed: () {},
                        style: TextButton.styleFrom(
                          foregroundColor: accentBlue,
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(0, 32),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text(
                          'Forgot PIN?',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 4. Main Button
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
                      shadowColor: Colors.transparent,
                    ),
                    child: const Text(
                      'Verify & Continue',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 5. Footer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have a digital ID? ",
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
          style: const TextStyle(fontSize: 15, color: textMain),
          decoration: InputDecoration(
            filled: true,
            fillColor: inputFill,
            hintText: hint,
            hintStyle: TextStyle(color: textSecondary.withOpacity(0.6)),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            suffixIcon: IconButton(
              icon: Icon(icon, size: 20, color: textSecondary),
              onPressed: onIconTap,
            ),
            // Default Border
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: inputBorder),
            ),
            // Focused Border
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: brandPrimary, width: 1.5),
            ),
            // Error Border (optional for future)
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.redAccent, width: 1),
            ),
          ),
        ),
      ],
    );
  }
}
