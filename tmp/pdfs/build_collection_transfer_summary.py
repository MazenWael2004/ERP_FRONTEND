from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
import arabic_reshaper
from bidi.algorithm import get_display

OUT = 'output/pdf/collection-transfer-settlement-workflow-summary-ar.pdf'
FONT = r'C:\Windows\Fonts\tahoma.ttf'
pdfmetrics.registerFont(TTFont('Arabic', FONT))

def rtl(text):
    return get_display(arabic_reshaper.reshape(str(text)))

styles = getSampleStyleSheet()
title = ParagraphStyle('TitleArabic', parent=styles['Title'], fontName='Arabic', fontSize=22, leading=31, alignment=TA_RIGHT, textColor=colors.HexColor('#0F172A'), spaceAfter=10)
subtitle = ParagraphStyle('SubtitleArabic', parent=styles['Normal'], fontName='Arabic', fontSize=10.5, leading=18, alignment=TA_RIGHT, textColor=colors.HexColor('#475569'), spaceAfter=18)
h1 = ParagraphStyle('H1Arabic', parent=styles['Heading1'], fontName='Arabic', fontSize=15, leading=23, alignment=TA_RIGHT, textColor=colors.HexColor('#075985'), spaceBefore=12, spaceAfter=8)
body = ParagraphStyle('BodyArabic', parent=styles['BodyText'], fontName='Arabic', fontSize=10.5, leading=18, alignment=TA_RIGHT, textColor=colors.HexColor('#1E293B'), spaceAfter=6)
small = ParagraphStyle('SmallArabic', parent=body, fontSize=9, leading=15, textColor=colors.HexColor('#64748B'))
cell = ParagraphStyle('CellArabic', parent=body, fontSize=9, leading=14, alignment=TA_RIGHT)
cell_center = ParagraphStyle('CellCenter', parent=cell, alignment=TA_CENTER)

def p(text, style=body): return Paragraph(rtl(text), style)
def bullets(items): return [p('• ' + item) for item in items]

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#CBD5E1')); canvas.line(1.6*cm, 1.35*cm, A4[0]-1.6*cm, 1.35*cm)
    canvas.setFont('Arabic', 8); canvas.setFillColor(colors.HexColor('#64748B'))
    canvas.drawRightString(A4[0]-1.6*cm, 0.85*cm, rtl('E-Operation | ملخص سير عمل توريد التحصيلات والتسوية المالية'))
    canvas.drawString(1.6*cm, 0.85*cm, f'{doc.page}')
    canvas.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, rightMargin=1.6*cm, leftMargin=1.6*cm, topMargin=1.45*cm, bottomMargin=1.8*cm)
story = []
story += [p('E-Operation', ParagraphStyle('Brand', parent=body, fontSize=11, textColor=colors.HexColor('#0284C7'), alignment=TA_RIGHT)), Spacer(1, 0.15*cm)]
story += [p('ملخص سير عمل توريد التحصيلات والتسوية المالية', title), p('وثيقة وظيفية - توضح ما تم تنفيذه في نظام E-Operation لإدارة عهدة التحصيلات، التوريد، المراجعة، والتسوية.', subtitle)]

overview = [[p('العنصر', cell_center), p('الوظيفة', cell_center)],
            [p('حالة الإيصال', cell), p('يبدأ التحصيل بحالة محصل، ثم ينتقل إلى مورد، ثم مسوى بعد اعتماد المالية.', cell)],
            [p('التوريدة', cell), p('تجميع عدة إيصالات في مسودة واحدة ثم إرسالها للمالية.', cell)],
            [p('التسوية', cell), p('تأكيد استلام ومراجعة التوريدة بالكامل دون إنشاء دفعة عميل جديدة.', cell)],
            [p('الرفض', cell), p('إرجاع الإيصالات إلى حالة محصل مع الاحتفاظ بالتاريخ وسبب الرفض.', cell)]]
t = Table(overview, colWidths=[4.2*cm, 12.4*cm]); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#E0F2FE')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#CBD5E1')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('RIGHTPADDING',(0,0),(-1,-1),8),('LEFTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); story += [t, Spacer(1, 0.35*cm)]
story += [p('1. دورة الإيصال المالية', h1)]
flow = [[p('COLLECTED', cell_center), p('TRANSFERRED', cell_center), p('SETTLED', cell_center)], [p('تم تحصيله وهو في عهدة منشئ الإيصال.', cell), p('تم إرسال التوريدة للمالية ولا يمكن تعديل الإيصال.', cell), p('تمت مراجعته وتسويته نهائيًا.', cell)]]
ft = Table(flow, colWidths=[5.5*cm]*3); ft.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),colors.HexColor('#FEF3C7')),('BACKGROUND',(1,0),(1,0),colors.HexColor('#DBEAFE')),('BACKGROUND',(2,0),(2,0),colors.HexColor('#DCFCE7')),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#CBD5E1')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)])); story += [ft]
story += bullets(['الانتقال الطبيعي: COLLECTED ثم TRANSFERRED ثم SETTLED.', 'في حالة رفض المالية: تعود الإيصالات من TRANSFERRED إلى COLLECTED فقط من خلال خدمة رفض التوريدة.', 'لا يمكن تسوية جزء من التوريدة في هذه النسخة؛ التسوية تشمل كل الإيصالات أو لا تتم.'])

story += [p('2. وظيفة صفحة توريد التحصيلات للمندوب', h1)]
story += bullets(['المسار: /collection-transfers.', 'المندوب يرى فقط الإيصالات التي أنشأها بنفسه، وليس بحسب مندوب العقد.', 'يدعم البحث برقم الإيصال، اسم العميل، كود العميل، رقم العقد، التاريخ وطريقة الدفع.', 'يمكن اختيار عدة إيصالات، اختيار جميع إيصالات الصفحة، رؤية العدد والإجمالي، ثم إضافة ملاحظات.', 'يتم إنشاء توريدة بحالة DRAFT ويمكن تعديل الإيصالات أو الملاحظات خلالها.', 'بعد التأكيد تصبح التوريدة TRANSFERRED وتنتقل للمالية ولا يمكن تعديلها.'])

story += [p('3. ضوابط النزاهة المالية ومنع التكرار', h1)]
story += bullets(['لا يمكن إدراج إيصال أكثر من مرة في التوريدة نفسها.', 'لا يمكن إدراج الإيصال في توريدتين نشطتين، بما في ذلك المسودة.', 'لا يقبل النظام إلا إيصالًا غير محذوف، موجَب القيمة، بحالة COLLECTED، ومنشأ بواسطة المستخدم الحالي.', 'يتم إعادة حساب عدد الإيصالات والإجمالي من الخادم وقت الإرسال؛ الواجهة لا تتحكم في الأرقام المالية.', 'تستخدم العمليات Transactions مع UPDLOCK و HOLDLOCK لمنع التضارب بين التعديل والإرسال والتسوية.'])

story += [p('4. وظيفة صفحة مراجعة وتسوية التوريدات للمالية', h1)]
story += bullets(['المسار: /collection-transfer-settlements.', 'تعرض التوريدات بحالة TRANSFERRED فقط، مع رقم التوريدة، اسم المندوب، التاريخ، العدد والإجمالي.', 'فتح أي توريدة يعرض كل إيصالاتها: الإيصال، العميل، العقد، طريقة الدفع وقيمة الإيصال.', 'تسوية التوريدة: تحول التوريدة وكل إيصالاتها إلى SETTLED في معاملة واحدة.', 'رفض التوريدة: السبب إلزامي، التوريدة تصبح REJECTED، وتعود الإيصالات إلى COLLECTED لتوريد جديد.', 'التوريدة المرفوضة أو المسوّاة غير قابلة للتعديل أو إعادة الاستخدام.'])

story += [p('5. ما لا تفعله التسوية', h1)]
story += bullets(['لا تنشئ تحصيل عميل جديد.', 'لا تعيد توزيع collection_lines ولا تؤثر على invoice_lines.', 'لا تسدد فاتورة للمرة الثانية.', 'هي خطوة استلام ومراجعة داخلية لعهدة التحصيل، وليست دفعة إضافية من الصيدلية.'])

story += [p('6. سجل التدقيق والصلاحيات', h1)]
story += bullets(['collection_workflow_history يسجل تاريخ انتقال حالة كل إيصال.', 'collection_transfer_workflow_history يسجل إنشاء وتعديل وإرسال وتسوية ورفض التوريدة.', 'كل حدث يسجل المنفذ، التوقيت، الحالة السابقة والحالية، والملاحظات أو سبب الرفض.', 'المندوب يملك إنشاء وتعديل وإرسال توريداته فقط.', 'Finance Manager و Accountant يملكون مراجعة وتسوية ورفض التوريدات.', 'System Admin لديه الصلاحيات الكاملة، مع تقرير مستقل للتوريدات.'])

story += [p('7. البيانات القديمة والتقارير', h1)]
story += bullets(['لم يتم اعتبار is_transferred مصدر الحقيقة الجديد.', 'السجل القديم الذي يملك سطر توريد موثق تم ترحيله كمسوى فقط.', 'أي سجل تاريخي لا يمكن إثبات حالته يدخل قائمة reconciliation للمراجعة المالية بدل تخمين حالته.', 'تم ربط تقارير التحصيلات وسجل الحركات المالية بحالة التسوية الجديدة، دون احتساب التوريدة كدفعة عميل ثانية.', 'يوفر API تقرير التوريدات مع فلترة بالمندوب، المنطقة، التاريخ، الحالة ورقم التوريدة.'])

api_heading = p('8. واجهات API الرئيسية', h1)
api_rows = [[p('العملية',cell_center),p('المسار',cell_center)],
            [p('الإيصالات المتاحة',cell),p('GET /collection-transfers/eligible-collections',cell)],
            [p('إنشاء مسودة',cell),p('POST /collection-transfers',cell)],
            [p('تعديل مسودة',cell),p('PATCH /collection-transfers/:id',cell)],
            [p('إرسال للمالية',cell),p('POST /collection-transfers/:id/submit',cell)],
            [p('توريداتي',cell),p('GET /collection-transfers/my-transfers',cell)],
            [p('قائمة المالية',cell),p('GET /collection-transfers/pending',cell)],
            [p('تسوية أو رفض',cell),p('POST /collection-transfers/:id/settle أو /reject',cell)],
            [p('تقرير',cell),p('GET /collection-transfers/report',cell)]]
at=Table(api_rows,colWidths=[5.2*cm,11.4*cm]);at.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#E0F2FE')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#CBD5E1')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]));story += [KeepTogether([api_heading,at,Spacer(1,.25*cm),p('التحقق المنفذ: تم تطبيق migration، والتحقق من قيود قاعدة البيانات والفهرس الفريد، وتشغيل اختبارات التحصيل والتحقق من الطلبات بنجاح. لم يتم إنشاء توريدات تجريبية في قاعدة البيانات المتصلة لعدم وجود إيصالات مؤهلة وقت الفحص.',small)])]

doc.build(story,onFirstPage=header_footer,onLaterPages=header_footer)
print(OUT)
