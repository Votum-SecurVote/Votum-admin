import 'package:flutter/material.dart';

class VoterDashboardScreen extends StatelessWidget {
  const VoterDashboardScreen({super.key});

  static const Color primaryColor = Color(0xFF2C5F81);
  static const Color bgLight = Color(0xFFF8F9FA);
  static const Color surface = Colors.white;
  static const Color textDark = Color(0xFF121516);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgLight,

      /// Bottom Navigation
      bottomNavigationBar: _buildBottomNav(),

      body: SafeArea(
        child: Column(
          children: [
            /// Top App Bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.dashboard, color: primaryColor),
                      SizedBox(width: 8),
                      Text(
                        'Dashboard',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: textDark,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: const [
                      Icon(Icons.notifications_none),
                      SizedBox(width: 12),
                      CircleAvatar(radius: 16, backgroundColor: Colors.grey),
                    ],
                  ),
                ],
              ),
            ),

            /// Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    /// Welcome
                    const Text(
                      'AUTHORIZED ACCESS',
                      style: TextStyle(
                        fontSize: 12,
                        letterSpacing: 1.5,
                        color: primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Welcome, John Doe',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: textDark,
                      ),
                    ),
                    const SizedBox(height: 12),

                    /// Identity Badge
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.shade100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            children: [
                              Icon(
                                Icons.verified_user,
                                size: 14,
                                color: Colors.green,
                              ),
                              SizedBox(width: 4),
                              Text(
                                'Identity Verified',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Voter ID: 123456789',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    /// Stats
                    Row(
                      children: [
                        _statCard('Active Elections', '02', primaryColor),
                        const SizedBox(width: 12),
                        _statCard('Completed', '14', textDark),
                      ],
                    ),

                    const SizedBox(height: 32),

                    /// Active Elections
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text(
                          'Active Elections',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Showing 2 of 2',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    _electionCard(
                      context: context,
                      title: '2024 Presidential Election',
                      date: 'Oct 20 — Nov 5, 2024',
                      description:
                          'Official national election for the executive branch.',
                      tag: 'National',
                    ),

                    const SizedBox(height: 20),

                    _electionCard(
                      context: context,
                      title: 'City Council - District 4',
                      date: 'Nov 1 — Nov 10, 2024',
                      description:
                          'Local representative election for your district.',
                      tag: 'Local',
                    ),

                    const SizedBox(height: 32),

                    /// Security Footer
                    Column(
                      children: const [
                        Icon(Icons.lock, size: 20, color: Colors.grey),
                        SizedBox(height: 4),
                        Text(
                          'END-TO-END ENCRYPTED',
                          style: TextStyle(
                            fontSize: 12,
                            letterSpacing: 1.5,
                            color: Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Server: SECURE-NODE-04 | Session: AES-256',
                          style: TextStyle(fontSize: 10, color: Colors.grey),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Components
  static Widget _statCard(String title, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _electionCard({
    required BuildContext context,
    required String title,
    required String date,
    required String description,
    required String tag,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 140,
            alignment: Alignment.topLeft,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: primaryColor.withOpacity(0.15),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: primaryColor,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                tag.toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(date, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 12),
                Text(description),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/election');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'View & Vote',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Bottom Nav
  static Widget _buildBottomNav() {
    return Container(
      height: 80,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: const [
          _NavItem(Icons.how_to_reg, 'Voter', true),
          _NavItem(Icons.admin_panel_settings, 'Admin', false),
          _NavItem(Icons.fact_check, 'Auditor', false),
          _NavItem(Icons.visibility, 'Observer', false),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;

  const _NavItem(this.icon, this.label, this.active);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          icon,
          size: 28,
          color: active ? VoterDashboardScreen.primaryColor : Colors.grey,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: active ? VoterDashboardScreen.primaryColor : Colors.grey,
          ),
        ),
      ],
    );
  }
}
