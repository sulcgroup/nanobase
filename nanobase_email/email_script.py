import codecs
import yagmail
import sys

path = ''
help = ''
credentials=''

# Determine if we are in the server or the vm
try:
    open('/var/www/nanobase.org/nanobase_email/login.txt', 'r')
    path = '/var/www/nanobase.org/nanobase_email/'
except FileNotFoundError:
    path = '/vagrant/nanobase/nanobase_email/'

try:
	credentials = open(path + 'login.txt', 'r').read().split(', ')
	help = open(path + 'help.txt', 'r').read()
except FileNotFoundError:
	print('Error: login/help file not found')

# Initialize email server
yag = yagmail.SMTP(credentials[0], credentials[1])

def send_email(args):
	argdict = {}
	currentargs = None
	try:
		for arg in args:
			if(arg[0] == '-'):
				# Check if we already have a list of these argments
				if(argdict.get(arg[1:], None)):
					currentargs = argdict.get(arg[1:])
				else:
					argdict[arg[1:]] = []
					currentargs = argdict[arg[1:]]
			else:
				currentargs.append(arg)

	except AttributeError:
		print('Error, argument passed before flag')
		exit(0)

	if(not argdict.get('d', None)):
		print('Error, destination email address not specified')
		exit(0)
	try:
		# Parse the desired template number
		template_num = int(argdict.get('t')[0])
	except AttributeError:
		print('Error, template number not specified')
		exit(0)
	except ValueError:
		print('Error, invalid template number')
		exit(0)

	# Open the templates file and get the right template
	with open(path + 'templates.txt', 'r') as file:
		# Templates separated by double semicolons
		templates = file.read().split(';;')
		# Header and footers are the first two template items
		header = templates[0]
		footer = templates[1]
		# Remaining templates
		templates = templates[2:]
		# Get the desired template
		try:
			# Subject line is first line, separated by body by double colons, so body is the second element in the split
			subject = templates[template_num].split('::')[0]
			template = templates[template_num].split('::')[1]

		except IndexError:
			print('Error, invalid template number')
			exit(0)
		# Put in the header and footer
		template = template.replace('<HEADER>', header)
		template = template.replace('<TAIL>', footer)
		# Insert the arguments
		for argtype, arglist in argdict.items():
			# Construct the argument template string to be repalced
			replacestr = '<' + argtype + '>'
			# Iterate through the available arguments.
			for arg in arglist:
				arg = arg.replace('_', ' ')
				# Replace arguments one at a time
				template = template.replace(replacestr, arg, 1)
		# Resolve any escape characters
		template = codecs.decode(template, 'unicode_escape')
		# Send the email
		mailtosend = [template]
		# Print(mailtosend[0])
		subject = subject.replace('\n', '')
		subject = codecs.decode(subject, 'unicode_escape')
		print('Email sent!')
		yag.send(argdict.get('d')[0], subject, mailtosend)

# Parse arguments
if('-h' in sys.argv):
	print(help)
	exit(0)

if('EmailScript.py' in sys.argv):
	args = sys.argv[1:]
	SendEmail(args)
