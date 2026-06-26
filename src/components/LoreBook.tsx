import React, { useState } from 'react';
import { soundEngine } from './SoundEngine';
import { BookOpen, Sparkles, MapPin, Milestone, HelpCircle } from 'lucide-react';

interface LoreBookProps {
  onBack: () => void;
}

interface LoreSection {
  id: string;
  tabTitle: string;
  title: string;
  subtitle: string;
  content: string[];
  bulletPoints?: string[];
  imageUrl?: string;
  culturalHint?: string;
}

const loreSections: LoreSection[] = [
  {
    id: 'phitakhon',
    tabTitle: 'ประเพณีผีตาโขน',
    title: 'กำเนิดเทศกาล "ผีตาโขน" แห่งด่านซ้าย',
    subtitle: 'ประเพณีละเล่นหน้ากากที่โด่งดังระดับโลก ณ จังหวัดเลย',
    content: [
      'ประเพณีผีตาโขน เป็นการละเล่นพื้นบ้านที่เป็นเอกลักษณ์อันโดดเด่นที่สุดของอำเภอด่านซ้าย จังหวัดเลย โดยจะจัดขึ้นเป็นประจำทุกปีในช่วงเดือน 7 หรือต้นเดือน 8 ท่ามกลางบรรยากาศงานบุญหลวง',
      'ตามตำนานเล่าขานว่า มีที่มาจากเรื่องราวของ "พระเวสสันดรชาดก" เมื่อครั้งพระเวสสันดรและพระนางมัทรีเสด็จกลับเข้าสู่เมืองหลวง เหล่าสิงสาราสัตว์รวมถึง "ภูตผีป่า" และ "ผีไพร" ที่อาศัยอยู่ในด่านซ้าย ต่างพากันดีใจและออกมาเฉลิมฉลองคอยส่งเสด็จกันอย่างสนุกสนาน',
      'คำว่า "ผีตาโขน" แต่เดิมสันนิษฐานว่าเพี้ยนมาจากคำว่า "ผีตามคน" หรือ "ผีตาขน" ซึ่งหมายถึงภูตผีผู้ติดตามสวมชุดแต่งกายที่ประดับตกแต่งด้วยเศษผ้าและสวมหน้ากากทำจากวัสดุธรรมชาติ'
    ],
    bulletPoints: [
      'จัดขึ้น ณ อำเภอด่านซ้าย จังหวัดเลย ประเทศไทย เท่านั้น',
      'เป็นส่วนหนึ่งของงาน "บุญหลวง" (งานบุญผะเหวดและงานบุญบั้งไฟรวมกัน)',
      'สะท้อนความเชื่อเรื่องการบูชาบรรพบุรุษ บูชาพญาแถน เพื่อขอฝนให้ตกต้องตามฤดูกาล'
    ],
    culturalHint: 'เกร็ดความรู้: ผีตาโขน จะสั่นกระดิ่งผูกเอว (เรียกว่า "หมากกระแหล่ง") ตลอดเวลาขณะเต้นรำ เพื่อส่งสัญญาณเรียกความอุดมสมบูรณ์!'
  },
  {
    id: 'masks',
    tabTitle: 'ประเภทหน้ากาก',
    title: 'งานศิลปะจากภูมิปัญญาชาวบ้าน',
    subtitle: 'ความแตกต่างของหน้ากากผีตาโขนแต่ละชนิด',
    content: [
      'หน้ากากผีตาโขนไม่ได้สร้างขึ้นมาเพื่อความน่ากลัว แต่เป็นหน้ากากแห่งความรื่นเริงและอุดมศิลปะ แบ่งออกเป็น 2 ประเภทหลักที่มีบทบาทสำคัญยิ่งในพิธีบวงสรวง',
      '1. ผีตาโขนใหญ่: ทำจากโครงไม้ไผ่ขนาดใหญ่ สูงกว่าคนทั่วไป ตกแต่งด้วยเสื้อผ้าเก่า มีเพศชายและหญิงอย่างละคู่ สร้างขึ้นโดยผู้ที่ได้รับอนุญาตและประกอบพิธีศักดิ์สิทธิ์เท่านั้น หลังจากเสร็จงานพิธีจะต้องนำไปลอยแม่น้ำหมัน ห้ามนำเข้าบ้านเด็ดขาด',
      '2. ผีตาโขนเล็ก: เป็นหน้ากากทั่วไปที่ชาวด่านซ้ายทุกเพศทุกวัยร่วมกันรังสรรค์และสวมใส่ละเล่นอย่างสนุกสนาน ซึ่งเป็นต้นแบบให้กับตัวละครเอกในเกม Dan Sai Adventure ของเรานั่นเอง!'
    ],
    bulletPoints: [
      'ส่วนหัว: ทำจาก "หวดนึ่งข้าวเหนียว" ที่สานด้วยไม้ไผ่แล้วพับขึ้นรูป',
      'ส่วนใบหน้า: ทำจาก "โคนก้านมะพร้าว" ถากเป็นรูปจมูกยาวโค้งงอคล้ายงวงช้าง',
      'ลวดลาย: ระบายสีสันฉูดฉาดงดงาม ลายไทย ลายกนก หรือลายโบราณอันละเอียดประณีต'
    ],
    culturalHint: 'วัสดุในเกม: ดอกฝ้าย ข้าวเหนียว และก้านมะพร้าว คือไอเทมสำคัญที่คุณสามารถรวบรวมได้เพื่อเพิ่มคะแนน!'
  },
  {
    id: 'geography',
    tabTitle: 'ดินแดนด่านซ้าย',
    title: 'อ้อมกอดแห่งขุนเขาและลุ่มน้ำหมัน',
    subtitle: 'ภูมิประเทศอันศักดิ์สิทธิ์และเงียบสงบของอำเภอด่านซ้าย',
    content: [
      'ด่านซ้าย เป็นอำเภอเล็กๆ ที่ซ่อนตัวอยู่ท่ามกลางหุบเขาอันสลับซับซ้อนในจังหวัดเลย มี "แม่น้ำหมัน" สายน้ำศักดิ์สิทธิ์หล่อเลี้ยงชุมชนมาอย่างยาวนาน',
      'สภาพอากาศที่นี่เย็นสบายตลอดปี มีภูเขาล้อมรอบ เช่น ภูเรือ และภูลมโล ทำให้ดินแดนนี้มีธรรมชาติที่สมบูรณ์ มีฝ้าย ข้าวไร่ และพืชผักเมืองหนาวมากมาย',
      'สถานที่สำคัญในประเพณีบุญหลวงคือ "วัดโพนชัย" และ "พระธาตุศรีสองรัก" เจดีย์โบราณแห่งสัจจะไมตรีระหว่างกรุงศรีอยุธยาและกรุงศรีสัตนาคนหุต (ล้านช้าง) ซึ่งเป็นจุดศูนย์รวมศรัทธาของชาวด่านซ้าย'
    ],
    bulletPoints: [
      'แม่น้ำหมัน: สายน้ำคู่บ้านคู่เมืองที่ไหลผ่านใจกลางอำเภอด่านซ้าย',
      'พระธาตุศรีสองรัก: ห้ามสวมเสื้อผ้าสีแดงหรือนำดอกไม้สีแดงเข้าไปสักการะเด็ดขาด (เพราะสีแดงสื่อถึงความขัดแย้งและการนองเลือด)',
      'ดินแดนแห่งต้นฝ้าย: มีการทอผ้าฝ้ายเมืองเลยอันเป็นเอกลักษณ์'
    ],
    culturalHint: 'สถานที่สำคัญในเกม: สเตจแรกของเกมจะเริ่มจากริมฝั่งแม่น้ำหมัน ผ่านตลาดชุมชนด่านซ้าย และขึ้นไปสิ้นสุดที่ลานวัดโพนชัย!'
  }
];

export default function LoreBook({ onBack }: LoreBookProps) {
  const [activeTab, setActiveTab] = useState<string>('phitakhon');

  const currentSection = loreSections.find(s => s.id === activeTab) || loreSections[0];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 bg-black border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.04)] relative overflow-hidden flex flex-col min-h-[520px] elegant-radial-bg">
      {/* Visual Fire/Mist Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Title */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
        <BookOpen className="text-white w-7 h-7 float-anim" />
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white font-sans tracking-widest uppercase">
            CULTURAL LORE
          </h2>
          <p className="text-[11px] text-gray-400 mt-1">
            เรื่องราวเบื้องหลังประเพณีผีตาโขนและดินแดนอันศักดิ์สิทธิ์ของจังหวัดเลย
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-3">
        {loreSections.map(section => (
          <button
            key={section.id}
            onClick={() => {
              soundEngine.playSelect();
              setActiveTab(section.id);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 tracking-wider ${
              activeTab === section.id
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {section.id === 'phitakhon' && <Sparkles size={12} />}
            {section.id === 'masks' && <HelpCircle size={12} />}
            {section.id === 'geography' && <MapPin size={12} />}
            {section.tabTitle}
          </button>
        ))}
      </div>

      {/* Main Lore Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Content detail */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase block mb-1">
              {currentSection.subtitle}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-white font-sans border-b border-white/5 pb-2">
              {currentSection.title}
            </h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed font-sans">
            {currentSection.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {currentSection.culturalHint && (
            <div className="p-3 bg-white/5 border-l-2 border-white rounded-r-lg text-gray-300 text-xs italic">
              {currentSection.culturalHint}
            </div>
          )}
        </div>

        {/* Highlights sidebar */}
        <div className="md:col-span-4 elegant-glass border border-white/10 rounded-xl p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-2.5">
            <Milestone size={12} />
            <span>Key Highlights</span>
          </div>

          <ul className="space-y-3">
            {currentSection.bulletPoints?.map((bullet, idx) => (
              <li key={idx} className="text-[11px] text-gray-400 flex items-start gap-2 leading-relaxed">
                <span className="text-white mt-1 font-bold">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer back button */}
      <div className="mt-8 border-t border-white/10 pt-5 flex justify-end">
        <button
          onClick={() => {
            soundEngine.playSelect();
            onBack();
          }}
          className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 text-xs font-extrabold tracking-widest rounded-lg transition-all duration-200"
        >
          BACK TO TITLE
        </button>
      </div>
    </div>
  );
}

