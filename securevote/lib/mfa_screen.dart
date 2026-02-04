import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class MFAScreen extends StatefulWidget {
  const MFAScreen({super.key});

  @override
  State<MFAScreen> createState() => _MFAScreenState();
}

class _MFAScreenState extends State<MFAScreen> {
  // Shared Palette
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color inputFill = Color(0xFFF9FAFB);
  static const Color inputBorder = Color(0xFFE5E7EB);

  final List<TextEditingController> controllers = List.generate(
    6,
    (_) => TextEditingController(),
  );
  final List<FocusNode> focusNodes = List.generate(6, (_) => FocusNode());

  @override
  void dispose() {
    for (final c in controllers) c.dispose();
    for (final f in focusNodes) f.dispose();
    super.dispose();
  }

  void _onChanged(String v, int i) {
    if (v.isNotEmpty && i < 5) {
      focusNodes[i + 1].requestFocus();
    }
    // Optional: Auto-submit if last digit is filled
    if (v.isNotEmpty && i == 5) {
      FocusScope.of(context).unfocus();
    }
  }

  void _onBackspace(int i) {
    if (i > 0 && controllers[i].text.isEmpty) {
      focusNodes[i - 1].requestFocus();
      controllers[i - 1].clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          color: textMain,
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: const Text(
          "VOTE.GOV",
          style: TextStyle(
            color: brandPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w800,
            letterSpacing: 2.0,
          ),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),

                // 1. Icon Header
                Container(
                  // padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: brandPrimary.withOpacity(0.05),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.security_rounded,
                    size: 40,
                    color: brandPrimary,
                  ),
                ),

                const SizedBox(height: 24),

                // 2. Title & Description
                const Text(
                  'Verify Identity',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: textMain,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 12),
                RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: const TextStyle(
                      fontSize: 15,
                      height: 1.5,
                      color: textSecondary,
                    ),
                    children: [
                      const TextSpan(text: 'Enter the secure code sent to\n'),
                      TextSpan(
                        text: 'j***@example.gov',
                        style: TextStyle(
                          color: textMain,
                          fontWeight: FontWeight.bold,
                          backgroundColor: brandPrimary.withOpacity(0.05),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),

                // 3. OTP Fields
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  alignment: WrapAlignment.center,
                  children: List.generate(6, (i) {
                    return SizedBox(
                      width: 48,
                      height: 56,
                      child: RawKeyboardListener(
                        focusNode: FocusNode(),
                        onKey: (e) {
                          if (e.isKeyPressed(LogicalKeyboardKey.backspace)) {
                            _onBackspace(i);
                          }
                        },
                        child: TextField(
                          controller: controllers[i],
                          focusNode: focusNodes[i],
                          autofocus: i == 0,
                          maxLength: 1,
                          textAlign: TextAlign.center,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: brandPrimary,
                          ),
                          decoration: InputDecoration(
                            counterText: '',
                            filled: true,
                            fillColor: inputFill,
                            contentPadding: EdgeInsets.zero,
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: inputBorder),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: brandPrimary,
                                width: 2,
                              ),
                            ),
                          ),
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                          ],
                          onChanged: (v) => _onChanged(v, i),
                        ),
                      ),
                    );
                  }),
                ),

                const SizedBox(height: 32),

                // 4. Timer & Resend
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.timer_outlined,
                      size: 16,
                      color: textSecondary,
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      '00:59',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Container(width: 1, height: 16, color: inputBorder),
                    const SizedBox(width: 16),
                    TextButton(
                      onPressed: () {},
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        foregroundColor: accentBlue,
                      ),
                      child: const Text(
                        'Resend Code',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 48),

                // 5. Main Action
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () =>
                        Navigator.pushReplacementNamed(context, '/dashboard'),
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
                      'Verify Securely',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // 6. Security Footer
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.lock,
                      size: 12,
                      color: textSecondary.withOpacity(0.5),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'End-to-end encrypted session',
                      style: TextStyle(
                        fontSize: 12,
                        color: textSecondary.withOpacity(0.7),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
