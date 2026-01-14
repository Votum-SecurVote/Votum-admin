import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class MFAScreen extends StatefulWidget {
  const MFAScreen({super.key});

  @override
  State<MFAScreen> createState() => _MFAScreenState();
}

class _MFAScreenState extends State<MFAScreen> {
  static const Color primaryColor = Color(0xFF2C5F81);
  static const Color textDark = Color(0xFF344760);
  static const Color borderGray = Color(0xFFDDE1E3);

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
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth > 390
                ? 390.0
                : constraints.maxWidth;

            return Align(
              alignment: Alignment.topCenter,
              child: SizedBox(
                width: width,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      /// Top bar
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.arrow_back_ios),
                            onPressed: () => Navigator.pop(context),
                          ),
                          const Expanded(
                            child: Text(
                              'Security Verification',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: textDark,
                              ),
                            ),
                          ),
                          const SizedBox(width: 40),
                        ],
                      ),

                      const SizedBox(height: 16),

                      /// Title
                      const Text(
                        'MFA Verification',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: textDark,
                        ),
                      ),

                      const SizedBox(height: 12),

                      /// Description
                      RichText(
                        text: const TextSpan(
                          style: TextStyle(
                            fontSize: 15,
                            height: 1.5,
                            color: Color(0xFF6A7881),
                          ),
                          children: [
                            TextSpan(
                              text:
                                  'A 6-digit code was sent to your registered email ',
                            ),
                            TextSpan(
                              text: '(j***@example.com)',
                              style: TextStyle(
                                color: primaryColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(
                              text:
                                  '. Please enter it below to cast your ballot.',
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 28),

                      /// OTP boxes (NO OVERFLOW)
                      Center(
                        child: Wrap(
                          spacing: 8, // horizontal spacing
                          runSpacing: 8, // vertical spacing (if wraps)
                          alignment: WrapAlignment.center,
                          children: List.generate(6, (i) {
                            return SizedBox(
                              width: 44, // slightly reduced width
                              height: 54,
                              child: RawKeyboardListener(
                                focusNode: FocusNode(),
                                onKey: (e) {
                                  if (e.isKeyPressed(
                                    LogicalKeyboardKey.backspace,
                                  )) {
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
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  decoration: InputDecoration(
                                    counterText: '',
                                    hintText: '•',
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: borderGray,
                                        width: 2,
                                      ),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: primaryColor,
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
                      ),

                      const SizedBox(height: 24),

                      /// Resend
                      Center(
                        child: Column(
                          children: const [
                            Text.rich(
                              TextSpan(
                                text: "Didn't receive a code? ",
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF6A7881),
                                ),
                                children: [
                                  TextSpan(
                                    text: 'Resend OTP',
                                    style: TextStyle(
                                      color: primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(height: 6),
                            Text(
                              'AVAILABLE IN 0:59',
                              style: TextStyle(
                                fontSize: 11,
                                letterSpacing: 1.5,
                                color: Color(0xFF9AA4AA),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 36),

                      /// Verify button (MATCHES IMAGE)
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                            elevation: 6,
                          ),
                          child: const Text(
                            'Verify Identity',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      /// Footer
                      Center(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(
                              Icons.verified_user,
                              size: 16,
                              color: Colors.grey,
                            ),
                            SizedBox(width: 6),
                            Text(
                              'END-TO-END ENCRYPTED E-VOTING SYSTEM',
                              style: TextStyle(
                                fontSize: 10,
                                letterSpacing: 0.6,
                                color: Colors.grey,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
