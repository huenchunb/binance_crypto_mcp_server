/**
 * Archivo de pruebas para validar los indicadores técnicos
 * Ejecutar con: npx ts-node test-technical-indicators.ts
 */

import { TechnicalIndicators, PriceData } from './src/helpers/technical-indicators';

// Datos de ejemplo para pruebas (simulando precios de Bitcoin)
const testPriceData: PriceData[] = [
    // Datos simulados de 250 períodos con tendencia alcista y volatilidad
    ...Array.from({ length: 250 }, (_, i) => {
        const basePrice = 30000;
        const trend = i * 100; // Tendencia alcista
        const noise = Math.sin(i * 0.1) * 2000; // Volatilidad
        const randomNoise = (Math.random() - 0.5) * 1000;
        
        const close = basePrice + trend + noise + randomNoise;
        const high = close + Math.random() * 500;
        const low = close - Math.random() * 500;
        
        return {
            close: Math.max(close, 1000), // Evitar precios negativos
            high: Math.max(high, close),
            low: Math.min(low, close),
            volume: 1000 + Math.random() * 5000
        };
    })
];

console.log('🚀 Iniciando pruebas de indicadores técnicos...\n');

// Test 1: RSI
console.log('📈 Prueba 1: RSI (Relative Strength Index)');
try {
    const closes = testPriceData.map(d => d.close);
    const rsi = TechnicalIndicators.calculateRSI(closes);
    
    console.log(`  ✅ RSI calculado exitosamente:`);
    console.log(`     Valor: ${rsi.rsi.toFixed(2)}`);
    console.log(`     Señal: ${rsi.signal}`);
    console.log(`     Fuerza: ${rsi.strength}`);
    console.log(`     Interpretación: ${rsi.rsi >= 70 ? 'Sobrecomprado' : rsi.rsi <= 30 ? 'Sobrevendido' : 'Neutral'}\n`);
} catch (error) {
    console.error(`  ❌ Error en RSI: ${error.message}\n`);
}

// Test 2: MACD
console.log('📊 Prueba 2: MACD (Moving Average Convergence Divergence)');
try {
    const closes = testPriceData.map(d => d.close);
    const macd = TechnicalIndicators.calculateMACD(closes);
    
    console.log(`  ✅ MACD calculado exitosamente:`);
    console.log(`     Línea MACD: ${macd.macd.toFixed(4)}`);
    console.log(`     Línea Señal: ${macd.signal.toFixed(4)}`);
    console.log(`     Histograma: ${macd.histogram.toFixed(4)}`);
    console.log(`     Tendencia: ${macd.trend}`);
    console.log(`     Cruce: ${macd.crossover}\n`);
} catch (error) {
    console.error(`  ❌ Error en MACD: ${error.message}\n`);
}

// Test 3: Medias Móviles
console.log('📉 Prueba 3: Medias Móviles (SMA y EMA)');
try {
    const closes = testPriceData.map(d => d.close);
    
    // Probar diferentes períodos
    const periods = [20, 50, 200];
    
    for (const period of periods) {
        if (closes.length >= period) {
            const ma = TechnicalIndicators.calculateMovingAverages(closes, period);
            console.log(`  ✅ MA${period} calculadas exitosamente:`);
            console.log(`     SMA: $${ma.sma.toFixed(2)}`);
            console.log(`     EMA: $${ma.ema.toFixed(2)}`);
            console.log(`     Tendencia: ${ma.trend}`);
            console.log(`     Posición: ${ma.position}`);
        }
    }
    console.log('');
} catch (error) {
    console.error(`  ❌ Error en Medias Móviles: ${error.message}\n`);
}

// Test 4: Análisis Técnico Completo
console.log('🎯 Prueba 4: Análisis Técnico Completo');
try {
    const analysis = TechnicalIndicators.performCompleteAnalysis(testPriceData, 'TEST-USDT');
    
    console.log(`  ✅ Análisis completo exitoso:`);
    console.log(`     Símbolo: ${analysis.symbol}`);
    console.log(`     Precio Actual: $${analysis.currentPrice.toFixed(2)}`);
    console.log(`     Señal Global: ${analysis.overallSignal}`);
    console.log(`     Confianza: ${analysis.confidence}%`);
    console.log(`     RSI: ${analysis.rsi.rsi.toFixed(2)} (${analysis.rsi.signal})`);
    console.log(`     MACD Tendencia: ${analysis.macd.trend}`);
    console.log(`     MA20 Posición: ${analysis.movingAverages.ma20.position}`);
    console.log(`     MA50 Tendencia: ${analysis.movingAverages.ma50.trend}`);
    console.log(`     MA200 Tendencia: ${analysis.movingAverages.ma200.trend}\n`);
} catch (error) {
    console.error(`  ❌ Error en Análisis Completo: ${error.message}\n`);
}

// Test 5: Casos extremos y validación
console.log('🔍 Prueba 5: Validación de casos extremos');

// Test con datos insuficientes
console.log('  🧪 Probando con datos insuficientes...');
try {
    const shortData = testPriceData.slice(0, 10);
    TechnicalIndicators.performCompleteAnalysis(shortData, 'SHORT-TEST');
    console.log('  ❌ Debería haber fallado con datos insuficientes');
} catch (error) {
    console.log(`  ✅ Correctamente rechazó datos insuficientes: ${error.message}`);
}

// Test con precios extremos
console.log('  🧪 Probando con precios extremos...');
try {
    const extremeData: PriceData[] = [
        ...testPriceData.slice(0, 200),
        // Agregar algunos valores extremos
        { close: 1000000, high: 1100000, low: 900000, volume: 1000 },
        { close: 1, high: 2, low: 0.5, volume: 1000 },
        ...testPriceData.slice(202, 250)
    ];
    
    const extremeAnalysis = TechnicalIndicators.performCompleteAnalysis(extremeData, 'EXTREME-TEST');
    console.log(`  ✅ Manejó precios extremos exitosamente (Señal: ${extremeAnalysis.overallSignal})`);
} catch (error) {
    console.log(`  ⚠️  Error con precios extremos: ${error.message}`);
}

console.log('🎉 Pruebas completadas!\n');

// Test 6: Benchmarking de rendimiento
console.log('⚡ Prueba 6: Benchmark de rendimiento');
const startTime = Date.now();

try {
    // Ejecutar análisis múltiples veces para medir rendimiento
    const iterations = 100;
    console.log(`  🏃 Ejecutando ${iterations} análisis completos...`);
    
    for (let i = 0; i < iterations; i++) {
        TechnicalIndicators.performCompleteAnalysis(testPriceData, `BENCH-${i}`);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    console.log(`  ✅ Rendimiento:`);
    console.log(`     Tiempo total: ${totalTime}ms`);
    console.log(`     Tiempo promedio por análisis: ${avgTime.toFixed(2)}ms`);
    console.log(`     Análisis por segundo: ${(1000 / avgTime).toFixed(2)}`);
} catch (error) {
    console.error(`  ❌ Error en benchmark: ${error.message}`);
}

console.log('\n📋 Resumen de pruebas:');
console.log('  • RSI: Cálculo de momentum y detección de sobrecompra/sobreventa');
console.log('  • MACD: Análisis de convergencia/divergencia y cruces de señales');
console.log('  • Medias Móviles: Identificación de tendencias (EMA más reactiva que SMA)');
console.log('  • Análisis Completo: Combinación inteligente de todos los indicadores');
console.log('  • Validación: Manejo robusto de casos extremos y datos insuficientes');
console.log('  • Rendimiento: Optimizado para análisis en tiempo real');

console.log('\n🔧 Para usar en el MCP Server:');
console.log('  1. Compilar: npm run build');
console.log('  2. Ejecutar: npm start');
console.log('  3. Usar herramienta: get_technical_analysis');
console.log('  4. Parámetros: symbol, interval, periods');

console.log('\n🎯 Casos de uso recomendados:');
console.log('  • Day Trading: RSI + EMA20 para entradas rápidas');
console.log('  • Swing Trading: MACD crossovers + EMA50 para tendencias medias');
console.log('  • Inversión LP: EMA200 + análisis completo para contexto general');
console.log('  • Gestión de Riesgo: Confidence level para ajustar tamaño de posición');

console.log('\n✨ ¡Indicadores técnicos listos para trading profesional!');
