import 'package:flutter/material.dart';

class BallotScreen extends StatefulWidget {
  const BallotScreen({super.key});

  @override
  State<BallotScreen> createState() => _BallotScreenState();
}

class _BallotScreenState extends State<BallotScreen> {
  // Shared Palette
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color cardBorder = Color(0xFFE5E7EB);
  static const Color selectedBg = Color(
    0xFFF0F9FF,
  ); // Very light blue for selection

  int? selectedIndex;

  final List<Map<String, String>> candidates = [
    {
      'name': 'Senator Alexandra Reed',
      'party': 'Democratic Party',
      'image': 'https://i.pravatar.cc/150?img=5', // Placeholder
    },
    {
      'name': 'Marcus Thorne',
      'party': 'Republican Party',
      'image': 'https://i.pravatar.cc/150?img=11', // Placeholder
    },
    {
      'name': 'Elena Rodriguez',
      'party': 'Independent',
      'image': 'https://i.pravatar.cc/150?img=9', // Placeholder
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,

      // 1. App Bar
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
          "OFFICIAL BALLOT",
          style: TextStyle(
            color: brandPrimary,
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              setState(() => selectedIndex = null);
            },
            tooltip: "Clear Selection",
            icon: const Icon(Icons.refresh_rounded, color: textSecondary),
          ),
        ],
      ),

      // 2. Bottom Submit Bar
      bottomNavigationBar: _buildBottomBar(),

      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 16,
                  ),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 3. Header Section
                      const Text(
                        'Cast Your Vote',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: textMain,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Select one candidate. This decision is final once submitted.',
                        style: TextStyle(fontSize: 15, color: textSecondary),
                      ),

                      const SizedBox(height: 32),

                      // 4. Candidates List
                      ...List.generate(
                        candidates.length,
                        (i) => _candidateTile(i),
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _candidateTile(int index) {
    final c = candidates[index];
    final selected = selectedIndex == index;
    final isWriteIn = c['image']!.isEmpty;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => setState(() => selectedIndex = index),
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: selected ? selectedBg : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? brandPrimary : cardBorder,
              width: selected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isWriteIn ? Colors.grey[100] : null,
                  image: !isWriteIn
                      ? DecorationImage(
                          image: NetworkImage(c['image']!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: isWriteIn
                    ? const Icon(Icons.edit_outlined, color: textSecondary)
                    : null,
              ),

              const SizedBox(width: 16),

              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c['name']!,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: selected ? brandPrimary : textMain,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      c['party']!.toUpperCase(),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: selected
                            ? brandPrimary.withOpacity(0.7)
                            : textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),

              // Radio Indicator
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected ? brandPrimary : cardBorder,
                    width: 2,
                  ),
                  color: selected ? brandPrimary : Colors.transparent,
                ),
                child: selected
                    ? const Icon(Icons.check, size: 16, color: Colors.white)
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      decoration: const BoxDecoration(
        color: bgCanvas,
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
                onPressed: selectedIndex == null
                    ? null
                    : () {
                        Navigator.pushNamedAndRemoveUntil(
                          context,
                          '/confirmation',
                          (route) => false,
                        );
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: brandPrimary,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey[200],
                  disabledForegroundColor: Colors.grey[400],
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Review & Submit',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.lock_clock_outlined,
                  size: 12,
                  color: textSecondary.withOpacity(0.5),
                ),
                const SizedBox(width: 6),
                Text(
                  'Vote Encrypted • Zero-Knowledge Proof',
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
