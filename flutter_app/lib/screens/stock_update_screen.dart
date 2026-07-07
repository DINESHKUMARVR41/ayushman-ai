import 'package:flutter/material.dart';
import '../services/sync_service.dart';
import '../services/voice_service.dart';

class StockUpdateScreen extends StatefulWidget {
  const StockUpdateScreen({Key? key}) : super(key: key);

  @override
  State<StockUpdateScreen> createState() => _StockUpdateScreenState();
}

class _StockUpdateScreenState extends State<StockUpdateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _itemNameController = TextEditingController();
  final _quantityController = TextEditingController();
  
  String _selectedCategory = 'Essential Medicine';
  String _selectedUnit = 'Tablets';
  bool _isOnline = false;
  bool _isListening = false;
  String _voiceFeedback = '';

  final List<String> _categories = ['Essential Medicine', 'Vaccine', 'Surgical Kit'];
  final List<String> _units = ['Tablets', 'Vials', 'Kits', 'Units'];

  @override
  void dispose() {
    _itemNameController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  void _toggleNetwork() {
    setState(() {
      _isOnline = !_isOnline;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isOnline ? 'Online mode active. Syncing queue...' : 'Offline mode active. Using local queue.'),
        backgroundColor: _isOnline ? Colors.green : Colors.amber[800],
      ),
    );
    if (_isOnline) {
      SyncService().synchronizeWithServer('http://10.0.2.2:3000');
    }
  }

  void _triggerVoiceInput() async {
    final voiceService = VoiceService();
    if (!_isListening) {
      setState(() {
        _isListening = true;
        _voiceFeedback = 'Listening... Say stock log details (e.g. "set 300 paracetamol")';
      });
      // Start recording simulation
      await Future.delayed(const Duration(seconds: 3));
      final transcript = await voiceService.toggleSpeechToText();
      
      if (transcript != null) {
        setState(() {
          _isListening = false;
          _voiceFeedback = 'Transcript: "$transcript"';
        });

        // Resolve via backend
        final result = await voiceService.processVoiceTranscript(
          serverUrl: 'http://10.0.2.2:3000',
          transcript: transcript,
          facilityId: 'FAC001',
          operatorEmail: 'worker_voice@ayushman.gov.in',
        );

        if (result != null) {
          setState(() {
            _voiceFeedback = result['speechOutput'] ?? 'Voice action logged successfully.';
            if (result['actionPayload'] != null) {
              _itemNameController.text = result['actionPayload']['item'] ?? '';
              _quantityController.text = (result['actionPayload']['quantity'] ?? '').toString();
            }
          });
        }
      }
    } else {
      setState(() {
        _isListening = false;
      });
    }
  }

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      final name = _itemNameController.text;
      final qty = int.parse(_quantityController.text);

      final syncService = SyncService();
      await syncService.queueUpdate(
        facilityId: 'FAC001',
        itemName: name,
        category: _selectedCategory,
        quantity: qty,
        unit: _selectedUnit,
        operatorEmail: 'manual_worker@ayushman.gov.in',
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Log saved securely to local SQLite queue.')),
      );

      _itemNameController.clear();
      _quantityController.clear();

      if (_isOnline) {
        await syncService.synchronizeWithServer('http://10.0.2.2:3000');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ayushman Clinician Portal', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: Icon(_isOnline ? Icons.wifi : Icons.wifi_off, color: _isOnline ? Colors.green : Colors.red),
            onPressed: _toggleNetwork,
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Voice Command Panel
            Card(
              color: Colors.slate[50],
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const Text('Hands-Free AI Log Assist', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    GestureDetector(
                      onTap: _triggerVoiceInput,
                      child: CircleAvatar(
                        radius: 36,
                        backgroundColor: _isListening ? Colors.red : const Color(0xFF8B5CF6),
                        child: Icon(
                          _isListening ? Icons.mic : Icons.mic_none,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _voiceFeedback.isEmpty ? 'Tap mic and speak your report' : _voiceFeedback,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontStyle: FontStyle.italic,
                        color: _isListening ? Colors.red : Colors.grey[700],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Form Update
            const Text('Manual Record Log', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 12),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _itemNameController,
                    decoration: const InputDecoration(
                      labelText: 'Item Name',
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) => v!.isEmpty ? 'Specify drug or resource name' : null,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _selectedCategory,
                    decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
                    items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (v) => setState(() => _selectedCategory = v!),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TextFormField(
                          controller: _quantityController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Quantity', border: OutlineInputBorder()),
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedUnit,
                          decoration: const InputDecoration(labelText: 'Unit', border: OutlineInputBorder()),
                          items: _units.map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                          onChanged: (v) => setState(() => _selectedUnit = v!),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _submitForm,
                    icon: const Icon(Icons.save_rounded),
                    label: const Text('Queue Local Record', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
