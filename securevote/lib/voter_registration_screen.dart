import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:typed_data';

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
  Uint8List? profileImage;

  String? selectedGender;

  bool showPassword = false;
  bool showConfirmPassword = false;

  Future<void> pickAadhaarPdf() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: true,
    );

    if (result != null) {
      setState(() => aadhaarPdf = result.files.single);
    }
  }

  Future<void> pickProfileImage() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );

    if (result != null) {
      setState(() => profileImage = result.files.single.bytes);
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
            letterSpacing: 2,
          ),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
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

                /// Profile Photo
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 42,
                        backgroundColor: inputBorder,
                        backgroundImage: profileImage != null
                            ? MemoryImage(profileImage!)
                            : null,
                        child: profileImage == null
                            ? const Icon(
                                Icons.person,
                                size: 42,
                                color: textSecondary,
                              )
                            : null,
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: pickProfileImage,
                        child: const Text('Upload Profile Photo'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                _buildSimpleField(
                  controller: nameController,
                  label: 'Full Legal Name',
                  hint: 'Jane Marie Doe',
                  icon: Icons.person_outline,
                ),

                const SizedBox(height: 20),

                _buildGenderField(),

                const SizedBox(height: 20),

                _buildSimpleField(
                  controller: dobController,
                  label: 'Date of Birth',
                  hint: 'MM / DD / YYYY',
                  icon: Icons.calendar_today,
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

                _buildAadhaarUpload(),

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

                const SizedBox(height: 32),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: brandPrimary,
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

  /// Gender Dropdown
  Widget _buildGenderField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Gender',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: textMain,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: selectedGender,
          hint: const Text('Select Gender'),
          items: const [
            DropdownMenuItem(value: 'Male', child: Text('Male')),
            DropdownMenuItem(value: 'Female', child: Text('Female')),
            DropdownMenuItem(value: 'Other', child: Text('Other')),
          ],
          onChanged: (value) => setState(() => selectedGender = value),
          decoration: _inputDecoration(),
        ),
      ],
    );
  }

  Widget _buildAadhaarUpload() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Aadhaar Document (PDF)',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: pickAadhaarPdf,
          icon: const Icon(Icons.upload_file),
          label: const Text('Upload Masked Aadhaar PDF'),
        ),
        if (aadhaarPdf != null)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(aadhaarPdf!.name, style: const TextStyle(fontSize: 12)),
          ),
      ],
    );
  }

  InputDecoration _inputDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: inputFill,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: inputBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: brandPrimary),
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
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          decoration: _inputDecoration().copyWith(
            hintText: hint,
            suffixIcon: Icon(icon),
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
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: !show,
          decoration: _inputDecoration().copyWith(
            hintText: '••••••••',
            suffixIcon: IconButton(
              icon: Icon(show ? Icons.visibility_off : Icons.visibility),
              onPressed: toggle,
            ),
          ),
        ),
      ],
    );
  }
}
