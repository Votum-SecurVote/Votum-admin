import 'package:flutter/material.dart';

class ElectionDetailsScreen extends StatelessWidget {
  const ElectionDetailsScreen({super.key});

  // Shared Palette
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color cardBorder = Color(0xFFE5E7EB);
  static const Color successGreen = Color(0xFF059669);
  static const Color successBg = Color(0xFFECFDF5);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,

      // 1. Transparent AppBar
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
          "ELECTION DETAILS",
          style: TextStyle(
            color: brandPrimary,
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
          ),
        ),
      ),

      // 2. Bottom Action Bar
      bottomNavigationBar: _buildBottomBar(context),

      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 3. Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: successBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: successGreen.withOpacity(0.2)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.circle, size: 8, color: successGreen),
                      SizedBox(width: 8),
                      Text(
                        'Active Now',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: successGreen,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // 4. Main Title
                const Text(
                  '2025 General Presidential Election',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: textMain,
                    height: 1.2,
                    letterSpacing: -0.5,
                  ),
                ),

                const SizedBox(height: 12),

                // 5. Timer Row (Clean Pill)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: brandPrimary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.timer_outlined, color: Colors.white, size: 16),
                      SizedBox(width: 8),
                      Text(
                        'Time Remaining:  2 Days, 14 Hours',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // 6. Dates Grid
                Row(
                  children: [
                    _infoCard(
                      label: 'Opens',
                      value: 'Oct 24, 2025',
                      sub: '08:00 AM EST',
                    ),
                    const SizedBox(width: 16),
                    _infoCard(
                      label: 'Closes',
                      value: 'Oct 26, 2025',
                      sub: '08:00 PM EST',
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                const Divider(height: 1, color: cardBorder),

                const SizedBox(height: 32),

                // 7. Rules Section
                const Text(
                  'Important Regulations',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: textMain,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Please review the requirements before voting.',
                  style: TextStyle(fontSize: 14, color: textSecondary),
                ),

                const SizedBox(height: 16),

                _accordion(
                  title: 'Eligibility Verified',
                  content:
                      'Your identity (ID: #GEN-2025) has been confirmed against the national registry.',
                ),
                _accordion(
                  title: 'Single Vote Policy',
                  content:
                      'You may only submit one ballot. Once cast, your decision is final and cannot be amended.',
                ),
                _accordion(
                  title: 'Anonymity Guarantee',
                  content:
                      'Your vote is decoupled from your identity using Zero-Knowledge Proof encryption.',
                ),

                const SizedBox(height: 40),

                // 8. Help Box
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: cardBorder),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.help_outline, color: textSecondary),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Having trouble?',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: textMain,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Contact support at 1-800-VOTE-HELP',
                            style: TextStyle(
                              fontSize: 12,
                              color: textSecondary.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 100), // Space for bottom bar
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _infoCard({
    required String label,
    required String value,
    required String sub,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: textSecondary,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textMain,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sub,
              style: const TextStyle(fontSize: 12, color: textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _accordion({required String title, required String content}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 15,
            color: textMain,
          ),
        ),
        iconColor: textSecondary,
        collapsedIconColor: textSecondary,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Text(
              content,
              style: const TextStyle(
                color: textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: cardBorder)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/ballot'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: brandPrimary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Access Digital Ballot',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 8),
                    Icon(Icons.arrow_forward_rounded, size: 20),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
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
                  'Signed by Federal Election Commission',
                  style: TextStyle(
                    fontSize: 11,
                    color: textSecondary.withOpacity(0.6),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
