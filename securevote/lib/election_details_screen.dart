import 'package:flutter/material.dart';

class ElectionDetailsScreen extends StatelessWidget {
  const ElectionDetailsScreen({super.key});

  static const Color primaryColor = Color(0xFF2C5F81);
  static const Color textDark = Color(0xFF121516);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      /// Bottom Action Bar
      bottomNavigationBar: _buildBottomBar(context),

      body: SafeArea(
        child: Column(
          children: [
            /// Top App Bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: primaryColor,
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Expanded(
                    child: Text(
                      'Election Details',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: textDark,
                      ),
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),

            /// Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 140),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    /// Status
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.shade100,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              CircleAvatar(
                                radius: 3,
                                backgroundColor: Colors.green,
                              ),
                              SizedBox(width: 6),
                              Text(
                                'ACTIVE',
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
                          'ID: #GEN-2024-001',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    /// Title
                    const Text(
                      '2024 General Presidential Election',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: textDark,
                      ),
                    ),

                    const SizedBox(height: 24),

                    /// Dates Grid
                    Row(
                      children: [
                        _infoCard(
                          icon: Icons.calendar_today,
                          title: 'Start Date',
                          value: 'Oct 24, 2024',
                          sub: '08:00 AM EST',
                        ),
                        const SizedBox(width: 12),
                        _infoCard(
                          icon: Icons.event_busy,
                          title: 'End Date',
                          value: 'Oct 26, 2024',
                          sub: '08:00 PM EST',
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    /// Remaining
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: primaryColor,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'REMAINING',
                                style: TextStyle(
                                  fontSize: 11,
                                  letterSpacing: 1.2,
                                  color: Colors.white70,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                '2 Days, 14 Hours',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          Icon(Icons.timer, color: Colors.white, size: 28),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    /// Rules
                    const Text(
                      'Voting Rules and Regulations',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Please review the following legal requirements before proceeding to the digital ballot box.',
                      style: TextStyle(color: Colors.grey),
                    ),

                    const SizedBox(height: 16),

                    _accordion(
                      icon: Icons.how_to_reg,
                      title: 'Eligibility Requirements',
                      content:
                          'You must be a registered citizen aged 18 or older. '
                          'Valid government ID verification is required.',
                    ),
                    _accordion(
                      icon: Icons.security,
                      title: 'Confidentiality Notice',
                      content:
                          'All votes are end-to-end encrypted and anonymous. '
                          'Zero-knowledge proofs ensure auditability.',
                    ),
                    _accordion(
                      icon: Icons.filter_1,
                      title: 'One-vote Policy',
                      content:
                          'Each voter is allowed exactly one submission. '
                          'Once cast, ballots cannot be changed.',
                    ),

                    const SizedBox(height: 24),

                    /// Help
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: primaryColor.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.info, color: primaryColor),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Need assistance?',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: primaryColor,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Contact 24/7 support at 1-800-VOTE-HELP.',
                                  style: TextStyle(fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
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
  static Widget _infoCard({
    required IconData icon,
    required String title,
    required String value,
    required String sub,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: primaryColor),
                const SizedBox(width: 6),
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(sub, style: const TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  static Widget _accordion({
    required IconData icon,
    required String title,
    required String content,
  }) {
    return ExpansionTile(
      tilePadding: const EdgeInsets.symmetric(horizontal: 8),
      leading: Icon(icon, color: Colors.grey),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(
            content,
            style: const TextStyle(color: Colors.grey, height: 1.4),
          ),
        ),
      ],
    );
  }

  static Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () {
                // Navigator.pushNamed(context, '/ballot');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Proceed to Ballot',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Securely signed by Federal Election Commission',
            style: TextStyle(
              fontSize: 10,
              letterSpacing: 1.2,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}
