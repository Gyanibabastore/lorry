const goodsKeywords = [
  'ajwain', 'aluminium section', 'angel channel', 'pati', 'battery scrap', 'cement',
  'chaddar', 'churi', 'coil', 'sheet', 'drum', 'finish goods', 'haldi', 'iron scrap',
  'metal scrap', 'ms plates', 'ms scrap', 'oil', 'pipe', 'plastic dana', 'plastic scrap',
  'Paper scrap','shutter material','tarafa',
  'rubber scrap', 'powder', 'raddi', 'pushta scrap', 'rolling scrap', 'steel', 'sugar',
  'tmt bar', 'tubes', 'tyre', 'scrap', 'dana', 'battery', 'aluminium', 'angel', 'finish',
  'plastic', 'plates', 'ms', 'rubber', 'pushta', 'rolling', 'tmt', 'bar', 'loha',
];

function extractDetails(message) {
  
  const msg = message.toLowerCase().replace(/\n/g, ' ').replace(/\s+/g, ' ');
 let truckNumber = '';
const rawMsg = msg.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
const lines = rawMsg.split(' ');
const joined = lines.join(' ');

console.log("📋 Tokens:", lines);
console.log("🔗 Joined Msg:", joined);

// ✅ Case 1: Extended truck format like "MP13ZE 0824"
const truckExtended = rawMsg.match(/\b([a-z]{2})[\s\-\.]?(\d{2})[\s\-\.]?([a-z]{1,3})[\s\-\.]?(\d{3,4})\b/i);
if (truckExtended) {
  truckNumber = (truckExtended[1] + truckExtended[2] + truckExtended[3] + truckExtended[4]).toUpperCase();
  console.log("✅ Matched Dotted Format:", truckNumber);
}


// ✅ Case 2: Spaced format like "mp09 dl 4213"
if (!truckNumber) {
  const truckPartsMatch = rawMsg.match(/\b([a-z]{2})\s+(\d{2})\s+([a-z]{1,3})\s+(\d{3,4})\b/i);

  console.log("🔍 truckPartsMatch:", truckPartsMatch);
  if (truckPartsMatch) {
    truckNumber = (truckPartsMatch[1] + truckPartsMatch[2] + truckPartsMatch[3] + truckPartsMatch[4]).toUpperCase();
    console.log("✅ Matched 4-Part Spaced:", truckNumber);
  }
}
// ✅ Case 2.1: 3-Part format like "mp09 dl 4213"
if (!truckNumber) {
  const threePartMatch = rawMsg.match(/\b([a-z]{2}\d{2})\s+([a-z]{1,3})\s+(\d{3,4})\b/i);
  if (threePartMatch) {
    truckNumber = (threePartMatch[1] + threePartMatch[2] + threePartMatch[3]).toUpperCase();
    console.log("✅ Matched 3-Part Format:", truckNumber);
  }
}


// ✅ Case 3: Sliding 3-line combination
if (!truckNumber) {
  for (let i = 0; i < lines.length - 3; i++) {
    const combined = lines[i] + lines[i + 1] + lines[i + 2] + lines[i + 3];
    if (/^[a-z]{2}\d{2}[a-z]{1,3}\d{3,4}$/i.test(combined)) {
      truckNumber = combined.toUpperCase();
      console.log("✅ Matched 4-Token Truck:", truckNumber);
      break;
    }
  }
}


// ✅ Case 4: Fully compact like "MP09DL4213"
if (!truckNumber) {
  const compactMatch = rawMsg.match(/\b([a-z]{2}\d{2}[a-z]{1,3}\d{3,4})\b/i);
  if (compactMatch) {
    truckNumber = compactMatch[1].toUpperCase();
    console.log("✅ Matched Compact Full:", truckNumber);
  }
}

console.log("🎯 Final Truck Number:", truckNumber);


  // ✅ Weight
 // ✅ Weight Extraction
let weight = '';

// 0️⃣ Match directly attached kg like "15500kg", "10550kgs"
if (!weight) {
  const kgMatch = msg.match(/\b(\d{4,6})kg[s]?\b/i);
  if (kgMatch) {
    const w = parseInt(kgMatch[1]);
    if (!isNaN(w)) weight = w.toString();
  }
}

// 1️⃣ Match "wt 19000", "weight 14000", "wt=23000 kg"
const wtMatch = msg.match(/\b(?:weight|wt|net)\s*[:=]?\s*(\d{4,6})(?:\s*kg[s]?)?\b/i);
if (wtMatch && !weight) {
  const w = parseInt(wtMatch[1]);
  if (!isNaN(w)) weight = w.toString();
}

// 2️⃣ Match tons: "30mtt", "8 mt", "13tn", "25tons"
if (!weight) {
  const tonMatch = msg.match(/\b(\d{1,3}(?:\.\d{1,3})?)\s*(mtt|tn|tons?|tonnes?|mt|kgs?)?\b/i);
  if (tonMatch) {
    const tons = parseFloat(tonMatch[1]);
    if (!isNaN(tons)) weight = Math.round(tons * 1000).toString();
  }
}

// 3️⃣ Match loose weight (e.g., 19000) but skip digits inside truck number
if (!weight) {
  const truckNums = (truckNumber.match(/\d+/g) || []).map(n => parseInt(n));
  const looseNums = [...msg.matchAll(/\b\d{4,6}\b/g)]
    .map(m => parseInt(m[0]))
    .filter(n => n >= 1000 && n <= 80000 && !truckNums.includes(n));

  if (looseNums.length) {
    weight = looseNums[0].toString();
  }
}

// 4️⃣ Fix 2-digit ton weight written as "20" → 20000
if (!weight) {
  const possibleTon = msg.match(/\b(\d{2})\b/);
  if (possibleTon) {
    const t = parseInt(possibleTon[1]);
    if (t >= 10 && t <= 80) weight = (t * 1000).toString();
  }
}

// 5️⃣ If under 5 digits, pad with zeros
if (weight && /^\d{1,2}$/.test(weight)) {
  weight = weight.padEnd(5, '0');
}


  // ✅ Description
  let description = '';
  for (const item of goodsKeywords) {
    if (msg.includes(item)) {
      description = item.toUpperCase();
      break;
    }
  }

  // ✅ From–To
 let from = '', to = '';
const msgWithoutDots = msg.replace(/\./g, '');
const locationWords = [];

for (const word of lines) {
  const cleaned = word.replace(/\./g, '').toLowerCase();
  if (
    /^[a-z]{4,20}$/i.test(cleaned) &&
    !goodsKeywords.includes(cleaned) &&
    isNaN(cleaned)
  ) {
    locationWords.push(cleaned.toUpperCase());
  }
}

// 1️⃣ Check structured format: "from X to Y"
const fromToMatch = msgWithoutDots.match(/\bfrom\s+([a-z]+)\s+to\s+([a-z]+)/i);
if (fromToMatch) {
  from = fromToMatch[1].toUpperCase();
  to = fromToMatch[2].toUpperCase();
} 
// 2️⃣ Check start of message format: "X to Y"
else {
  const startToMatch = msgWithoutDots.match(/^([a-z]+)\s+to\s+([a-z]+)/i);
  if (startToMatch) {
    from = startToMatch[1].toUpperCase();
    to = startToMatch[2].toUpperCase();
  } 
  // 3️⃣ Check middle pattern: "someword to someword"
  else {
    const midToMatch = msgWithoutDots.match(/\b([a-z]{2,})\s+to\s+([a-z]{2,})\b/i);

    if (midToMatch) {
      from = midToMatch[1].toUpperCase();
      to = midToMatch[2].toUpperCase();
    } 
    // 4️⃣ Smart fallback: pick first two locations
    else if (locationWords.length >= 2) {
      // 🧠 Fix: to = first word, from = second
      to = locationWords[0];
      from = locationWords[1];
    } 
    // 5️⃣ Only one location found
    else if (locationWords.length === 1) {
      to = locationWords[0];
    }
  }
}

  return {
    truckNumber,
    from,
    to,
    weight,
    description
  };
}

function isStructuredLR(message) {
  const d = extractDetails(message);

  // Log what failed
  if (!d.truckNumber) console.log("❌ Missing Truck Number");
  if (!d.to) console.log("❌ Missing TO Location");
  if (!d.weight) console.log("❌ Missing Weight");
  if (!d.description) console.log("❌ Missing Description");

  return d.truckNumber && d.to && d.weight && d.description;
}


module.exports = { extractDetails, isStructuredLR };    
