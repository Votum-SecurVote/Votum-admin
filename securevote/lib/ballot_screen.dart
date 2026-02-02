import 'package:flutter/material.dart';

class BallotScreen extends StatefulWidget {
  const BallotScreen({super.key});

  @override
  State<BallotScreen> createState() => _BallotScreenState();
}

class _BallotScreenState extends State<BallotScreen> {
  static const Color primaryColor = Color(0xFF2C5F81);
  static const Color textDark = Color(0xFF121516);

  int? selectedIndex;

  final List<Map<String, String>> candidates = [
    {
      'name': 'Senator Alexandra Reed',
      'party': 'Democratic Party',
      'image':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBGeNST_BCeXiCUUZTkrZk3MclpxxwuMmU4TVVHIgrIPO6uuETzoQFC_WPLEs4x_hRmA-s6vdLaR_kC3pnjJiuJhPVAdtmun-JOy0bwCNeh7_TgrXcFw81bOMrjp7NJsswpkEaOgJPrghTQIW7tGY8cMpAxDphYZrEg3tbMejmfzqhOppSyMmfzN4geahRClhdpVrLjjtpmeR875Uvu5rN0xn3MQn9go7PO2QELF_K8R3lW5KSn5gYOhO8iQcVXOqhTOglVkP-d5kXF',
    },
    {
      'name': 'Marcus Thorne',
      'party': 'Republican Party',
      'image':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAC2T23xkdgMve8XF9F54pRSghxVwE9DNbyPa2VaYlcnSiS80CxVEmOJa8nWQv5diCL-89kPegZC666BtlhgK9OnkPKq7qj_3NLSk7TGxuZvyShWWDsfFexk2U6cbeW9zNNQS8FbWJMWt6UIvp5j1z6eyZ_UtQUeNkp9_wBVYYouUqFwygKckh0_YiK3F7GfTRkpJIj3SrGBxiUbdDibR-jaM2vHcrZF-o7xQg7gsuSX-n1omYP9RVT32FW-ZhzqAIdVcLhWX_OCkX2',
    },
    {
      'name': 'Elena Rodriguez',
      'party': 'Independent',
      'image':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCjJwGuAk7yOgIFyjZbgt_R4P_qMG-DwnofbtQZVJcj7TbivZaVf_wINXz9J8loPZaOte2rlGIb_tDtN4wl6Kv3eO8o9CVO4ctdNLMVbIQe2yGBzpp3prhUZcB40PRDiL4Sm4bDIufTucbaqurJhGSICmKwSxo1Hl_xQGGoejY-vvz0Tf_9jQsiC5OVH0wIXy9C97jushZVYt7ST-gRevHIMMMpPf5nH5Z_tKPcaeHE_YstiQ73-DhJHqkK5eawNJtcMbU34fWg__Mn',
    },
    {'name': 'Write-in Candidate', 'party': 'Manual Entry', 'image': ''},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      /// Bottom Submit Bar
      bottomNavigationBar: _buildBottomBar(),

      body: SafeArea(
        child: Column(
          children: [
            /// Top Bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios, color: primaryColor),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Expanded(
                    child: Text(
                      'Cast Your Ballot',
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

            /// Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 140),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '2024 General Election',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Select one candidate from the list below. '
                      'Your vote is encrypted, verified, and anonymous.',
                      style: TextStyle(color: Colors.grey),
                    ),

                    const SizedBox(height: 24),

                    /// Candidate List
                    ...List.generate(
                      candidates.length,
                      (i) => _candidateTile(i),
                    ),

                    const SizedBox(height: 16),

                    /// Clear Selection
                    Center(
                      child: TextButton(
                        onPressed: () {
                          setState(() => selectedIndex = null);
                        },
                        child: const Text(
                          'Clear Selection',
                          style: TextStyle(
                            color: primaryColor,
                            decoration: TextDecoration.underline,
                          ),
                        ),
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

  Widget _candidateTile(int index) {
    final c = candidates[index];
    final selected = selectedIndex == index;

    return GestureDetector(
      onTap: () => setState(() => selectedIndex = index),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? primaryColor : const Color(0xFFE5E7EB),
            width: 2,
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x14000000),
              blurRadius: 6,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            /// Avatar
            c['image']!.isNotEmpty
                ? CircleAvatar(
                    radius: 28,
                    backgroundImage: NetworkImage(c['image']!),
                  )
                : CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.grey.shade200,
                    child: const Icon(Icons.person, color: Colors.grey),
                  ),

            const SizedBox(width: 16),

            /// Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c['name']!,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(c['party']!, style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),

            /// Radio
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: selected ? primaryColor : Colors.grey,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
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
            child: ElevatedButton.icon(
              onPressed: selectedIndex == null
                  ? null
                  : () {
                      Navigator.pushReplacementNamed(context, '/confirmation');
                    },
              icon: const Icon(Icons.how_to_reg),
              label: const Text('Submit Vote'),
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                disabledBackgroundColor: Colors.grey.shade300,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'END-TO-END ENCRYPTED SESSION',
            style: TextStyle(
              fontSize: 10,
              letterSpacing: 1.5,
              color: Colors.grey,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
