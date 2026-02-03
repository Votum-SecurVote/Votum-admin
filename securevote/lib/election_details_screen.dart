import 'package:flutter/material.dart';

class ElectionDetailsScreen extends StatelessWidget {
  const ElectionDetailsScreen({super.key});

  // Shared Palette - Refined for higher contrast
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color bgCanvas = Color(0xFFF8FAFC); // Soft cool gray background
  static const Color textMain = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color cardBorder = Color(0xFFE2E8F0);
  static const Color successGreen = Color(0xFF10B981);
  static const Color successBg = Color(0xFFECFDF5);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            color: textMain,
            onPressed: () => Navigator.pop(context),
          ),
        ),
        centerTitle: true,
        title: const Text(
          "ELECTION DETAILS",
          style: TextStyle(
            color: brandPrimary,
            fontSize: 11,
            fontWeight: FontWeight.w900,
            letterSpacing: 2.0,
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomBar(context),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Live Status Badge
                _buildLiveBadge(),

                const SizedBox(height: 20),

                // 2. Main Title
                const Text(
                  '2025 General Presidential Election',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: textMain,
                    height: 1.1,
                    letterSpacing: -0.8,
                  ),
                ),

                const SizedBox(height: 24),

                // 3. Countdown Card
                _buildTimerCard(),

                const SizedBox(height: 32),

                // 4. Dates Grid
                Row(
                  children: [
                    _infoCard(
                      icon: Icons.login_rounded,
                      label: 'Polls Open',
                      value: 'Oct 24, 2025',
                      sub: '08:00 AM EST',
                    ),
                    const SizedBox(width: 12),
                    _infoCard(
                      icon: Icons.logout_rounded,
                      label: 'Polls Close',
                      value: 'Oct 26, 2025',
                      sub: '08:00 PM EST',
                    ),
                  ],
                ),

                const SizedBox(height: 32),
                const Divider(height: 1, color: cardBorder),
                const SizedBox(height: 32),

                // 5. Regulations Section
                const Row(
                  children: [
                    Icon(Icons.gavel_rounded, size: 20, color: brandPrimary),
                    SizedBox(width: 10),
                    Text(
                      'Important Regulations',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: textMain,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Please review the legal requirements before casting your digital ballot.',
                  style: TextStyle(fontSize: 14, color: textSecondary),
                ),

                const SizedBox(height: 16),

                _accordion(
                  title: 'Eligibility Verified',
                  content:
                      'Your identity (ID: #GEN-2025) has been confirmed against the national registry. You are cleared to vote in this district.',
                ),
                _accordion(
                  title: 'Single Vote Policy',
                  content:
                      'Strict one-person-one-vote policy. Once submitted, the cryptographic hash is generated and cannot be undone.',
                ),
                _accordion(
                  title: 'Anonymity Guarantee',
                  content:
                      'We use AES-256 bit encryption and Zero-Knowledge Proofs to ensure your identity is never linked to your selection.',
                ),

                const SizedBox(height: 24),

                // 6. Help Box
                _buildHelpBox(),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLiveBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: successBg,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: successGreen.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: successGreen,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          const Text(
            'ACTIVE NOW',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: successGreen,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimerCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: brandPrimary,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: brandPrimary.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'TIME REMAINING',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '2 Days : 14 Hours : 22 Mins',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w700,
              fontFamily: 'monospace', // Gives a digital clock feel
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoCard({
    required IconData icon,
    required String label,
    required String value,
    required String sub,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: textSecondary),
            const SizedBox(height: 12),
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: textSecondary,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: textMain,
              ),
            ),
            Text(
              sub,
              style: const TextStyle(fontSize: 11, color: textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _accordion({required String title, required String content}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cardBorder),
      ),
      child: ExpansionTile(
        shape: const RoundedRectangleBorder(side: BorderSide.none),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 15,
            color: textMain,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
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

  Widget _buildHelpBox() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cardBorder),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            backgroundColor: Colors.white,
            child: Icon(Icons.support_agent, color: brandPrimary),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Need assistance?',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: textMain,
                  ),
                ),
                Text(
                  '24/7 Helpline: 1-800-VOTE-HELP',
                  style: TextStyle(fontSize: 12, color: textSecondary),
                ),
              ],
            ),
          ),
          Icon(
            Icons.arrow_forward_ios_rounded,
            size: 14,
            color: textSecondary.withOpacity(0.5),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 40),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 60,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: brandPrimary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/ballot'),
                child: const Text(
                  'Access Digital Ballot',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.verified_user_outlined,
                size: 14,
                color: successGreen,
              ),
              const SizedBox(width: 8),
              Text(
                'End-to-End Verifiable Encryption',
                style: TextStyle(
                  fontSize: 11,
                  color: textSecondary.withOpacity(0.8),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
