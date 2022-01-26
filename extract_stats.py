import matplotlib.pyplot as plt
import numpy as np
from sys import argv
from os import listdir

update_stats_query = ("UPDATE Structures SET statsData = %s WHERE id = %s")

def stats(top_file):
    with open(top_file) as f:
        #strand lengths
        s_lengths = []
        p_lengths = []

        #running length counters
        s_counter = 0
        p_counter = 0

        f.readline() #skip the header. it's inconsistent because of the protein model
        l = f.readline()
        current = l.split(' ')[0]
        while l:
            l = l.split(' ')
            if int(current) > 0:
                if l[0] != current:
                    s_lengths.append(s_counter)
                    s_counter = 0
                    current = l[0]
                else:
                    s_counter += 1
            else:
                if l[0] != current:
                    p_lengths.append(p_counter)
                    p_counter = 0
                    current = l[0]
                else:
                    p_counter += 1
            l = f.readline()

    #catch the last strand
    if s_counter > 0:
        s_lengths.append(s_counter)
    elif p_counter > 0:
        p_lengths.append(p_counter)
    
    total_n = int(np.sum(s_lengths))

    # remove scaffold from the list if it exists.  1000 is an entirely arbitrary cutoff.
    s_lengths = [i for i in s_lengths if i < 1000]

    #make a histogram of staple lengths
    out_name = ""
    if len(s_lengths) > 1:
        out_name = "staple_lens.png"
        fig, ax = plt.subplots()
        bins = np.linspace(min(s_lengths), max(s_lengths), 20)
        ax.hist(s_lengths, bins)
        ax.spines['right'].set_visible(False)
        ax.spines['top'].set_visible(False)
        ax.set_ylabel('Count')
        ax.set_xlabel('Length')
        path = top_file.split('/')[:-1]
        path.append(out_name)
        plt.savefig('/'.join(path))
        plt.close()

    #output is:   total nucleotides | #non-scaffold strands | total amino acids | #peptides | graph name
    return("{total_n}|{n_staples}|{total_a}|{n_peptides}|{graph}".format(total_n=total_n, n_staples=len(s_lengths), total_a=int(np.sum(p_lengths)), n_peptides=len(p_lengths), graph=out_name))

if __name__ == '__main__':
    import database
    for dir in listdir(argv[1]):
        path = argv[1]+'/'+dir+'/structure/'
        try:
            top = [t for t in listdir(argv[1]+'/'+dir+'/structure/') if '.top' in t][0]
            results = stats(path+top)
            connection = database.pool.get_connection()
            with connection.cursor() as cursor:
                cursor.execute(update_stats_query, (results,dir))
            connection.close()
        except Exception as e:
            print(e)
            print('No topology or bad topology found in ', dir)
