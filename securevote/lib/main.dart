import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Added for status bar control
import 'package:securevote/ballot_screen.dart';
import 'package:securevote/election_details_screen.dart';
import 'package:securevote/mfa_screen.dart';
import 'package:securevote/vote_confirmation_screen.dart';
import 'package:securevote/voter_dashboard_screen.dart';
import 'package:securevote/voter_registration_screen.dart';
import 'package:securevote/VoterProfileScreen.dart';
import 'login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Set status bar to transparent for full-screen gradient effect
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const EVotingApp());
}

class EVotingApp extends StatelessWidget {
  const EVotingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Secure E-Voting System',
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        fontFamily: 'PublicSans',
        // Modern Color Scheme
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1A3B5D), // Deep Navy
          primary: const Color(0xFF1A3B5D),
          secondary: const Color(0xFF0096C7), // Trust Blue
          background: const Color(0xFFF8F9FA),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/mfa': (context) => const MFAScreen(),
        '/register': (context) => const VoterRegistrationScreen(),
        '/dashboard': (context) => const VoterDashboardScreen(),
        '/election': (context) => const ElectionDetailsScreen(),
        '/ballot': (context) => const BallotScreen(),
        '/confirmation': (context) => const VoteConfirmationScreen(),
        '/profile': (context) => const VoterProfileScreen(),
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    // Initialize Animation Controller
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeIn));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.5), // Start slightly below
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));

    _controller.forward();

    // Navigate after 3 seconds
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Defined localized colors for the splash
    const primaryDeep = Color(0xFF1A3B5D);
    const primaryLight = Color(0xFFF0F4F8);

    return Scaffold(
      // Gradient Background for a premium feel
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              const Color(0xFFE3F2FD), // Very light blue
            ],
          ),
        ),
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Animated Logo Stack
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            // Outer Ripple (Static for now, could be animated)
                            Container(
                              width: 200,
                              height: 200,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: primaryDeep.withOpacity(0.05),
                                  width: 2,
                                ),
                              ),
                            ),
                            Container(
                              width: 160,
                              height: 160,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: primaryDeep.withOpacity(0.1),
                                  width: 2,
                                ),
                              ),
                            ),
                            // Main Icon Background
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                                boxShadow: [
                                  BoxShadow(
                                    color: primaryDeep.withOpacity(0.15),
                                    blurRadius: 20,
                                    offset: const Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: const Center(
                                child: Icon(
                                  Icons.how_to_vote_rounded, // Better icon
                                  size: 64,
                                  color: primaryDeep,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 48),

                        // Title Text
                        Column(
                          children: [
                            const Text(
                              'SecureVote',
                              style: TextStyle(
                                fontSize: 36,
                                fontWeight: FontWeight.w800,
                                color: primaryDeep,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'E-VOTING SYSTEM',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 3.0,
                                color: primaryDeep.withOpacity(0.6),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Footer Section
            Padding(
              padding: const EdgeInsets.only(bottom: 50),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  children: [
                    const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: primaryDeep,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'ESTABLISHING SECURE CONNECTION',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        color: primaryDeep.withOpacity(0.5),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.lock_outline,
                          size: 12,
                          color: primaryDeep.withOpacity(0.4),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Encrypted • Verified • Safe',
                          style: TextStyle(
                            fontSize: 12,
                            color: primaryDeep.withOpacity(0.4),
                          ),
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
}
