import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

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
  bool acceptTerms = false;
  bool acceptPrivacy = false;
  bool confirmEligibility = false;
  bool confirmInformation = false;

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

  Future<void> submitRegistration() async {
    if (aadhaarPdf == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload Aadhaar PDF')),
      );
      return;
    }

    // Determine Base URL
    String baseUrl = 'http://localhost:8080';
    if (!kIsWeb) {
      // Android Emulator uses 10.0.2.2 to access host localhost
      try {
        if (Platform.isAndroid) {
          baseUrl = 'http://10.0.2.2:8080';
        }
      } catch (e) {
        // Fallback to localhost if Platform check fails
      }
    }

    final uri = Uri.parse('$baseUrl/api/auth/register');

    final request = http.MultipartRequest('POST', uri);

    // ---- TEXT FIELDS ----
    request.fields['fullName'] = nameController.text;
    request.fields['gender'] = selectedGender ?? '';
    request.fields['dateOfBirth'] = dobController.text;
    request.fields['email'] = emailController.text;
    request.fields['phone'] = phoneController.text;
    request.fields['address'] = addressController.text;
    request.fields['aadhaarNumber'] = aadharController.text;
    request.fields['password'] = passwordController.text;
    request.fields['confirmPassword'] = confirmPasswordController.text;

    // ---- FILE: Aadhaar PDF ----
    request.files.add(
      http.MultipartFile.fromBytes(
        'aadhaarPdf',
        aadhaarPdf!.bytes!,
        filename: aadhaarPdf!.name,
      ),
    );

    // ---- FILE: Profile Image (optional) ----
    if (profileImage != null) {
      request.files.add(
        http.MultipartFile.fromBytes(
          'profileImage',
          profileImage!,
          filename: 'profile.jpg',
        ),
      );
    }

    try {
      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Registration submitted successfully')),
        );
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $responseBody')));
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed: $e')));
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

                const Text(
                  'Declarations & Consent',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: textMain,
                  ),
                ),

                const SizedBox(height: 12),

                _buildCheckbox(
                  value: acceptTerms,
                  onChanged: (v) => setState(() => acceptTerms = v!),
                  text: 'I accept the Terms & Conditions',
                ),

                _buildCheckbox(
                  value: acceptPrivacy,
                  onChanged: (v) => setState(() => acceptPrivacy = v!),
                  text: 'I accept the Privacy Policy',
                ),

                _buildCheckbox(
                  value: confirmEligibility,
                  onChanged: (v) => setState(() => confirmEligibility = v!),
                  text: 'I confirm that I am legally eligible to vote',
                ),

                _buildCheckbox(
                  value: confirmInformation,
                  onChanged: (v) => setState(() => confirmInformation = v!),
                  text:
                      'I confirm that all the information provided is true and correct',
                ),

                const SizedBox(height: 12),

                const Text(
                  'False information or impersonation may lead to rejection or legal action.',
                  style: TextStyle(
                    fontSize: 11,
                    color: textSecondary,
                    height: 1.4,
                  ),
                ),

                const SizedBox(height: 12),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      if (!acceptTerms ||
                          !acceptPrivacy ||
                          !confirmEligibility ||
                          !confirmInformation) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Please accept all declarations to proceed.',
                            ),
                          ),
                        );
                        return;
                      }
                      submitRegistration();
                    },
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
                        color: Colors.white,
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

Widget _buildCheckbox({
  required bool value,
  required ValueChanged<bool?> onChanged,
  required String text,
}) {
  return CheckboxListTile(
    value: value,
    onChanged: onChanged,
    dense: true,
    contentPadding: EdgeInsets.zero,
    controlAffinity: ListTileControlAffinity.leading,
    activeColor: const Color(0xFF1A434E),
    title: Text(text, style: const TextStyle(fontSize: 13)),
  );
}
