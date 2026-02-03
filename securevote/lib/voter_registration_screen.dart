import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';

class VoterRegistrationScreen extends StatefulWidget {
  const VoterRegistrationScreen({super.key});

  @override
  State<VoterRegistrationScreen> createState() =>
      _VoterRegistrationScreenState();
}

class _VoterRegistrationScreenState extends State<VoterRegistrationScreen> {
  // Shared Palette
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color inputFill = Color(0xFFF9FAFB);
  static const Color inputBorder = Color(0xFFE5E7EB);

  final TextEditingController nameController = TextEditingController();
  final TextEditingController dobController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController aadharController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController =
      TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();

  PlatformFile? aadhaarPdf;

  bool showPassword = false;
  bool showConfirmPassword = false;

  Future<void> pickAadhaarPdf() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: true,
    );

    if (result != null && result.files.isNotEmpty) {
      setState(() {
        aadhaarPdf = result.files.single;
      });
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Registration',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: textMain,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Complete your profile to access your ballot.',
                  style: TextStyle(fontSize: 15, color: textSecondary),
                ),

                const SizedBox(height: 24),

                _buildSimpleField(
                  controller: nameController,
                  label: 'Full Legal Name',
                  hint: 'Jane Marie Doe',
                  icon: Icons.person_outline_rounded,
                ),

                const SizedBox(height: 20),

                _buildSimpleField(
                  controller: dobController,
                  label: 'Date of Birth',
                  hint: 'MM / DD / YYYY',
                  icon: Icons.calendar_today_rounded,
                ),

                const SizedBox(height: 20),

                _buildSimpleField(
                  controller: emailController,
                  label: 'Email Address',
                  hint: 'you@example.com',
                  icon: Icons.email_outlined,
                ),

                const SizedBox(height: 20),

                _buildSimpleField(
                  controller: phoneController,
                  label: 'Phone Number',
                  hint: '+91 XXXXX XXXXX',
                  icon: Icons.phone_outlined,
                ),

                const SizedBox(height: 20),

                _buildSimpleField(
                  controller: addressController,
                  label: 'Residential Address',
                  hint: 'Street, City, State, Zip',
                  icon: Icons.location_on_outlined,
                  maxLines: 3,
                ),

                const SizedBox(height: 20),

                _buildSimpleField(
                  controller: aadharController,
                  label: 'Aadhaar Number',
                  hint: '12-digit Aadhaar Number',
                  icon: Icons.badge_outlined,
                ),

                const SizedBox(height: 20),

                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Aadhaar Document (PDF)',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: textMain,
                      ),
                    ),
                    const SizedBox(height: 8),

                    OutlinedButton.icon(
                      onPressed: pickAadhaarPdf,
                      icon: const Icon(Icons.upload_file),
                      label: const Text('Upload Masked Aadhaar PDF'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        side: const BorderSide(color: inputBorder),
                      ),
                    ),

                    if (aadhaarPdf != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(
                            Icons.picture_as_pdf,
                            size: 18,
                            color: Colors.green,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              aadhaarPdf!.name,
                              style: const TextStyle(fontSize: 13),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 6),
                    const Text(
                      'Upload masked Aadhaar (only last 4 digits visible)',
                      style: TextStyle(fontSize: 11, color: textSecondary),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                _buildPasswordField(
                  controller: passwordController,
                  label: 'Password',
                  show: showPassword,
                  toggle: () => setState(() => showPassword = !showPassword),
                ),

                const SizedBox(height: 20),

                _buildPasswordField(
                  controller: confirmPasswordController,
                  label: 'Confirm Password',
                  show: showConfirmPassword,
                  toggle: () => setState(
                    () => showConfirmPassword = !showConfirmPassword,
                  ),
                ),

                const SizedBox(height: 28),

                // Admin verification note
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.info_outline,
                      size: 16,
                      color: brandPrimary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Your application will be reviewed by an administrator. '
                        'Once your details are verified, you will be allowed to vote.',
                        style: TextStyle(
                          fontSize: 12,
                          color: textSecondary.withOpacity(0.9),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {},
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
                      'Submit Application',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
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
    int maxLines = 1,
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
          maxLines: maxLines,
          decoration: InputDecoration(
            filled: true,
            fillColor: inputFill,
            hintText: hint,
            suffixIcon: Icon(icon, color: textSecondary),
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

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String label,
    required bool show,
    required VoidCallback toggle,
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
          obscureText: !show,
          decoration: InputDecoration(
            filled: true,
            fillColor: inputFill,
            hintText: '••••••••',
            suffixIcon: IconButton(
              icon: Icon(
                show ? Icons.visibility_off : Icons.visibility,
                color: textSecondary,
              ),
              onPressed: toggle,
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
