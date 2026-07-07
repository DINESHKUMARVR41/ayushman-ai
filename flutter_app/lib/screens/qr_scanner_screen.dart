import 'package:flutter/material.dart';
import '../services/sync_service.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({Key? key}) : super(key: key);

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool _isScanning = true;
  String _scanResult = 'Align stock barcode/QR within focus boundary';

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _simulateScan() async {
    if (!_isScanning) return;
    setState(() {
      _scanResult = 'Analyzing barcode...';
    });

    await Future.delayed(const Duration(seconds: 1));

    // Decoded structured batch: "BATCH-COV2-901 | COVID-19 Rapid Kits | 350 Kits"
    final scannedItemName = 'COVID-19 Rapid Kits';
    final scannedQty = 350;

    final syncService = SyncService();
    await syncService.queueUpdate(
      facilityId: 'FAC001',
      itemName: scannedItemName,
      category: 'Surgical Kit',
      quantity: scannedQty,
      unit: 'Kits',
      operatorEmail: 'qr_scanner_operator@ayushman.gov.in',
    );

    setState(() {
      _isScanning = false;
      _scanResult = 'Decoded Batch Successfully:\n$scannedItemName - $scannedQty Kits queued locally!';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Scanned supply batch registered offline in SQLite sync queue.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _resetScanner() {
    setState(() {
      _isScanning = true;
      _scanResult = 'Align stock barcode/QR within focus boundary';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR Supply Intake', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: Column(
        children: [
          Expanded(
            flex: 4,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Camera screen mockup
                Container(
                  color: Colors.black,
                  width: double.infinity,
                  child: const Icon(Icons.camera_alt_rounded, color: Colors.white54, size: 64),
                ),
                // Laser beam scanning overlay
                if (_isScanning)
                  AnimatedBuilder(
                    animation: _animationController,
                    builder: (context, child) {
                      final double offset = _animationController.value * 280 - 140;
                      return Transform.translate(
                        offset: Offset(0, offset),
                        child: Container(
                          width: 280,
                          height: 4,
                          color: Colors.red,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.red.withOpacity(0.8),
                              blurRadius: 8,
                              spreadRadius: 2,
                            )
                          ],
                        ),
                      );
                    },
                  ),
                // Target scanning box frame
                Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    border: Border.all(color: _isScanning ? Colors.greenAccent : Colors.grey, width: 3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16.0),
              color: Colors.slate[900],
              width: double.infinity,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _scanResult,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 12),
                  if (_isScanning)
                    ElevatedButton.icon(
                      onPressed: _simulateScan,
                      icon: const Icon(Icons.flash_on),
                      label: const Text('Trigger Laser Scan Simulation'),
                    )
                  else
                    ElevatedButton.icon(
                      onPressed: _resetScanner,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Scan Next Batch'),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
