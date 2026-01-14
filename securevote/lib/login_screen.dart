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

  static const Color primaryColor = Color(0xFF2C5F81);
  static const Color institutionalGray = Color(0xFFF8F9FA);
  static const Color charcoal = Color(0xFF344760);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  /// Top App Bar
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: const [
                        Icon(Icons.shield, color: primaryColor, size: 32),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'National E-Voting Portal',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: charcoal,
                            ),
                          ),
                        ),
                        SizedBox(width: 32),
                      ],
                    ),
                  ),

                  /// Hero Image
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: SizedBox(
                        height: 160,
                        child: Image.network(
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuA_aFChmGAF5X40KAR6V6XVCtd3-vysEmFexz1jmDRb23mSJ6ccivLSfZxAnvt1CA-HbL66znHzqRUxJOqRcyAWN5vyBnScRmhO3REcqFwPsFc0dnXtZS6CqHwCK1j3pjJ5eqV4c4wuHoSGDncQTB55rb4bhh41oA7-TRMSsgHIA7ro99rIbiwlVkQGmdugQ3lMt3P3O_SZsh6_0KFWMF02UoqxvVhr4yUFPiu-82kxJ8625M_mTZcTwYDwWy9eDjv5pgqqTt6WY69K',
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),

                  /// Title & Description
                  const Padding(
                    padding: EdgeInsets.fromLTRB(24, 24, 24, 8),
                    child: Text(
                      'Secure Login',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: charcoal,
                      ),
                    ),
                  ),

                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      'Authenticate your identity to cast your official ballot in the current session.',
                      style: TextStyle(fontSize: 16, color: Color(0xFF6A7881)),
                    ),
                  ),

                  /// Login Card
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: institutionalGray,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Color(0xFFE5E7EB)),
                    ),
                    child: Column(
                      children: [
                        _buildField(
                          label: 'Voter Email Address',
                          controller: emailController,
                          hint: 'e.g. voter@domain.gov',
                          icon: Icons.mail_outline,
                        ),

                        _buildField(
                          label: 'Secure PIN or Password',
                          controller: passwordController,
                          hint: '••••••••',
                          icon: showPassword
                              ? Icons.visibility
                              : Icons.visibility_off,
                          obscure: !showPassword,
                          onIconTap: () {
                            setState(() {
                              showPassword = !showPassword;
                            });
                          },
                        ),

                        /// Forgot password
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {},
                            child: const Text(
                              'Forgot Access Details?',
                              style: TextStyle(color: primaryColor),
                            ),
                          ),
                        ),

                        /// Login button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              // Navigator.pushReplacementNamed(context, '/dashboard');
                            },
                            icon: const Icon(Icons.login),
                            label: const Text('Sign In to Vote'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              textStyle: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        /// Security Divider
                        Row(
                          children: const [
                            Expanded(child: Divider()),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8),
                              child: Text(
                                'SECURITY VERIFIED',
                                style: TextStyle(
                                  fontSize: 11,
                                  letterSpacing: 1.5,
                                  color: Colors.grey,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Expanded(child: Divider()),
                          ],
                        ),

                        const SizedBox(height: 12),

                        /// Encryption text
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.lock, size: 16, color: Colors.grey),
                            SizedBox(width: 6),
                            Text(
                              'End-to-end encrypted connection',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  /// Register section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      children: [
                        const Text(
                          "Don't have a digital voter ID?",
                          style: TextStyle(color: Color(0xFF6A7881)),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton(
                          onPressed: () {
                            // Navigator.pushNamed(context, '/register');
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: primaryColor),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Register as a New Voter',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  /// Footer
                  const Padding(
                    padding: EdgeInsets.only(top: 32),
                    child: Text(
                      'Official Government Application • v2.4.0',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 10,
                        letterSpacing: 1.5,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscure = false,
    VoidCallback? onIconTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              color: charcoal,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: controller,
            obscureText: obscure,
            decoration: InputDecoration(
              hintText: hint,
              suffixIcon: IconButton(icon: Icon(icon), onPressed: onIconTap),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: primaryColor),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
