import 'package:flutter/material.dart';

class VoterRegistrationScreen extends StatefulWidget {
  const VoterRegistrationScreen({super.key});

  @override
  State<VoterRegistrationScreen> createState() =>
      _VoterRegistrationScreenState();
}

class _VoterRegistrationScreenState extends State<VoterRegistrationScreen> {
  // Shared Palette (From Login Screen)
  static const Color brandPrimary = Color(0xFF1A434E); // Deep Slate Teal
  static const Color accentBlue = Color(0xFF3B82F6); // Trust Blue
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color inputFill = Color(0xFFF3F4F6);

  final TextEditingController nameController = TextEditingController();
  final TextEditingController dobController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController govIdController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,
      body: Stack(
        children: [
          // 1. Background Decoration (Consistent with Login)
          Positioned(
            top: -100,
            right: -50,
            child: CircleAvatar(
              radius: 150,
              backgroundColor: accentBlue.withOpacity(0.05),
            ),
          ),

          SafeArea(
            child: Center(
              // 2. Responsive Constraint
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  children: [
                    // 3. Custom App Bar
                    _buildAppBar(context),

                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        physics: const BouncingScrollPhysics(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 20),

                            // 4. Status Card
                            _buildStatusCard(),

                            const SizedBox(height: 32),

                            // 5. Section Header
                            const Text(
                              'Personal Information',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: textMain,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Ensure all details match your legal documentation exactly.',
                              style: TextStyle(
                                fontSize: 14,
                                color: textSecondary,
                                height: 1.4,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // 6. Form Fields
                            _buildModernField(
                              label: 'Full Legal Name',
                              controller: nameController,
                              hint: 'ex. Jane Marie Doe',
                              icon: Icons.person_outline_rounded,
                            ),

                            const SizedBox(height: 20),

                            _buildModernField(
                              label: 'Date of Birth',
                              controller: dobController,
                              hint: 'MM/DD/YYYY',
                              icon: Icons.calendar_today_rounded,
                              isDate: true,
                            ),

                            const SizedBox(height: 20),

                            _buildModernField(
                              label: 'Residential Address',
                              controller: addressController,
                              hint: 'Street, City, State, Zip',
                              icon: Icons.location_on_outlined,
                              maxLines: 3,
                            ),

                            const SizedBox(height: 20),

                            _buildModernField(
                              label: 'Government ID Number',
                              controller: govIdController,
                              hint: 'ID or Passport Number',
                              icon: Icons.badge_outlined,
                            ),

                            const SizedBox(height: 24),

                            // 7. Security Badge
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: brandPrimary.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: brandPrimary.withOpacity(0.1),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.lock_outline_rounded,
                                    color: brandPrimary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 12),
                                  const Expanded(
                                    child: Text(
                                      'Data encrypted with 256-bit security. Only shared with electoral boards.',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: brandPrimary,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 32),

                            // 8. Submit Button
                            SizedBox(
                              width: double.infinity,
                              height: 56,
                              child: ElevatedButton(
                                onPressed: () {},
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: brandPrimary,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
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

                            const SizedBox(height: 16),

                            Center(
                              child: TextButton(
                                onPressed: () {},
                                child: const Text(
                                  "View Requirements",
                                  style: TextStyle(color: textSecondary),
                                ),
                              ),
                            ),

                            const SizedBox(height: 40),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            style: IconButton.styleFrom(
              backgroundColor: inputFill,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
              color: textMain,
            ),
          ),
          const Expanded(
            child: Text(
              'Registration',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: textMain,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(width: 48), // Balance the back button space
        ],
      ),
    );
  }

  Widget _buildStatusCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: inputFill),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: brandPrimary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.pending_actions_rounded,
              color: brandPrimary,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'STATUS',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: textSecondary.withOpacity(0.7),
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Not Submitted',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: brandPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    bool isDate = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: textSecondary,
              letterSpacing: 1.1,
            ),
          ),
        ),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: isDate ? TextInputType.datetime : TextInputType.text,
          decoration: InputDecoration(
            filled: true,
            fillColor: inputFill,
            hintText: hint,
            hintStyle: TextStyle(color: textSecondary.withOpacity(0.5)),
            suffixIcon: Padding(
              padding: EdgeInsets.only(
                right: 12,
                top: maxLines > 1 ? 12 : 0,
                bottom: maxLines > 1 ? 40 : 0,
              ),
              child: Icon(icon, size: 20, color: textSecondary),
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: brandPrimary, width: 2),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: 20,
              vertical: maxLines > 1 ? 20 : 18,
            ),
          ),
        ),
      ],
    );
  }
}
