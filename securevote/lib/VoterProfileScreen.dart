import 'package:flutter/material.dart';

class VoterProfileScreen extends StatelessWidget {
  const VoterProfileScreen({super.key});

  // Shared Palette
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color bgCanvas = Color(0xFFF9FAFB);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color cardBorder = Color(0xFFE5E7EB);
  static const Color successGreen = Color(0xFF059669);
  static const Color successBg = Color(0xFFECFDF5);
  static const Color dangerRed = Color(0xFFDC2626);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,
      appBar: AppBar(
        backgroundColor: bgCanvas,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: textMain,
          onPressed: () => Navigator.maybePop(context),
        ),
        centerTitle: true,
        title: const Text(
          "PROFILE",
          style: TextStyle(
            color: brandPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Profile Avatar Section
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    CircleAvatar(
                      radius: 54,
                      backgroundColor: brandPrimary.withOpacity(0.1),
                      child: const Icon(Icons.person_rounded, size: 54, color: brandPrimary),
                    ),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: const Icon(Icons.camera_alt, size: 18, color: textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'John Doe',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textMain),
                ),
                const SizedBox(height: 8),
                _buildStatusChip(),
                const SizedBox(height: 32),

                // Info Sections
                _infoCard(
                  title: 'Personal Information',
                  children: [
                    const _InfoRow('Email', 'john.doe@example.com'),
                    const _InfoRow('Phone', '+91 98765 43210'),
                    const _InfoRow('Date of Birth', '12 Aug 2001'),
                    const _InfoRow('Gender', 'Male', isLast: true),
                  ],
                ),
                const SizedBox(height: 16),
                _infoCard(
                  title: 'Address',
                  children: [
                    const _InfoRow(
                      'Residential',
                      '221B Baker Street, Chennai, TN, 600001',
                      isLast: true,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _infoCard(
                  title: 'Voter Details',
                  children: [
                    const _InfoRow('Voter ID', 'ABC1234567'),
                    const _InfoRow('Registration', 'Active', isLast: true),
                  ],
                ),
                const SizedBox(height: 32),

                // Actions
                _buildActionButton(
                  label: 'Edit Profile',
                  icon: Icons.edit_outlined,
                  onPressed: () {},
                  isPrimary: false,
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  label: 'Logout',
                  icon: Icons.logout_rounded,
                  onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                  isPrimary: true,
                  color: dangerRed,
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: successBg,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: successGreen.withOpacity(0.2)),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified_user_rounded, size: 14, color: successGreen),
          SizedBox(width: 6),
          Text(
            'VERIFIED VOTER',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: successGreen),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required VoidCallback onPressed,
    required bool isPrimary,
    Color? color,
  }) {
    final themeColor = color ?? brandPrimary;
    return SizedBox(
      width: double.infinity,
      child: isPrimary
          ? ElevatedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 20, color: Colors.white),
              label: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: themeColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
            )
          : OutlinedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 20, color: themeColor),
              label: Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: themeColor)),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: themeColor.withOpacity(0.5)),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
    );
  }

  static Widget _infoCard({required String title, required List<Widget> children}) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
        color: Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 20, top: 16, bottom: 8),
            child: Text(
              title.toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: textSecondary, letterSpacing: 1),
            ),
          ),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isLast;

  const _InfoRow(this.label, this.value, {this.isLast = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280), fontWeight: FontWeight.w500),
                ),
              ),
              Expanded(
                flex: 4,
                child: Text(
                  value,
                  textAlign: TextAlign.right,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
                ),
              ),
            ],
          ),
        ),
        if (!isLast) const Divider(height: 1, indent: 20, endIndent: 20, color: Color(0xFFF3F4F6)),
      ],
    );
  }
}